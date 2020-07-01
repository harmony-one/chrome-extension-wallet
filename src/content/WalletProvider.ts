"use strict";
import { Transaction } from "@harmony-js/transaction";
import { Account } from "@harmony-js/account";
import { HarmonyAddress } from "@harmony-js/crypto";
import { Unit } from "@harmony-js/utils";
import { decryptKeyStore } from "../lib/txnService";
import { StakingTransaction } from "@harmony-js/staking";

//Constant define                           @author:raptor1001
const HARMONY_REQUEST_TYPE = "TO_ONEWALLET_EXTENSION";
const HARMONY_RESPONSE_TYPE = "FROM_ONEWALLET_EXTENSION";

export const TRANSACTIONTYPE = {
  SEND: "SEND",
  DELEGATE: "DELEGATE",
  UNDELEGATE: "UNDELEGATE",
  WITHDRAWREWARD: "WITHDRAWREWARD",
};

export const STAKINGTYPE = {
  DELEGATE: 2,
  UNDELEGATE: 3,
  WITHDRAWREWARD: 4,
};
//end define

//start communicate with content-script      @author:raptor1001
const unWrapMessageFromContentScript = (data: any) => data.message;
const filterExtensionMessage = (callback: any) => (message: any) => {
  if (message === undefined) return;
  const { detail } = message;
  if (!detail) return;
  if (detail.type && detail.type === HARMONY_RESPONSE_TYPE) {
    callback(detail);
  }
};

function waitForResponse(type: any) {
  return new Promise((resolve) => {
    const handler = filterExtensionMessage((data: any) => {
      const message = unWrapMessageFromContentScript(data);
      if (message.type === type) {
        resolve(message.payload);
      }

      // cleanup
      window.removeEventListener("ONEWALLET_SERVICE_EVENT_RESPONSE", handler);
    });
    window.addEventListener("ONEWALLET_SERVICE_EVENT_RESPONSE", handler);
  });
}

const sendMessageToContentScript = (payload: any) => {
  window.dispatchEvent(
    new CustomEvent("ONEWALLET_SERVICE_EVENT_REQUEST", {
      detail: {
        type: HARMONY_REQUEST_TYPE,
        payload,
      },
    })
  );
};

const sendAsyncMessageToContentScript = async (payload: any) => {
  // I think we can deal with async console errors problems by returning true
  sendMessageToContentScript(payload);

  // await async response
  const response: any = await waitForResponse(`${payload.type}_RESPONSE`);
  return response;
};
//end communicate with content-script

//getTxnInfo                  @author:raptor1001
const getTxnInfo = (transaction: Transaction | StakingTransaction) =>
  new Promise((resolve, reject) => {
    let response: any;
    try {
      if (transaction.constructor.name === Transaction.name) {
        const txnParams = (transaction as Transaction).txParams;
        response = {
          type: TRANSACTIONTYPE.SEND,
          txnInfo: {
            from: new HarmonyAddress(txnParams.from).bech32,
            to: new HarmonyAddress(txnParams.to).bech32,
            amount: Unit.Wei(txnParams.value).toEther(),
            gasLimit: Unit.Wei(txnParams.gasLimit).toWeiString(),
            gasPrice: Unit.Wei(txnParams.gasPrice).toGwei(),
            fromShard: txnParams.shardID,
            toShard: txnParams.toShardID,
          },
        };
      } else if (transaction.constructor.name === StakingTransaction.name) {
        const stakeTransaction: any = JSON.parse(JSON.stringify(transaction));
        const stakeMsg: any = stakeTransaction.stakeMsg;
        const delegatorAddress = new HarmonyAddress(stakeMsg.delegatorAddress)
          .bech32;
        const gasLimit = Unit.Wei(stakeTransaction.gasLimit).toWeiString();
        const gasPrice = Unit.Wei(stakeTransaction.gasPrice).toGwei();
        if (
          stakeTransaction.directive === STAKINGTYPE.DELEGATE ||
          stakeTransaction.directive === STAKINGTYPE.UNDELEGATE
        ) {
          response = {
            type:
              stakeTransaction.directive === STAKINGTYPE.DELEGATE
                ? TRANSACTIONTYPE.DELEGATE
                : TRANSACTIONTYPE.UNDELEGATE,
            txnInfo: {
              from: delegatorAddress,
              to: new HarmonyAddress(stakeMsg.validatorAddress).bech32,
              amount: Unit.Wei(stakeMsg.amount).toEther(),
              gasLimit,
              gasPrice,
            },
          };
        } else if (stakeTransaction.directive === STAKINGTYPE.WITHDRAWREWARD) {
          response = {
            type: TRANSACTIONTYPE.WITHDRAWREWARD,
            txnInfo: {
              from: delegatorAddress,
              gasLimit,
              gasPrice,
            },
          };
        }
      }
      resolve(response);
    } catch (err) {
      reject(err);
    }
  });
class WalletProvider {
  isOneWallet: Boolean;
  version: any;
  constructor() {
    this.version = "1.0.0";
    this.isOneWallet = true;
  }
  async getAccount() {
    return new Promise(async (resolve, reject) => {
      try {
        const acc = await sendAsyncMessageToContentScript({
          hostname: window.location.host,
          type: "THIRDPARTY_GET_ACCOUNT_REQUEST",
        });
        console.log("acc", acc);
        if (acc.rejected) {
          return resolve("User rejected login request");
        }
        resolve(acc);
      } catch (err) {
        reject(err);
      }
    });
  }
  async signTransaction(
    transaction: Transaction | StakingTransaction,
    updateNonce?: boolean,
    encodeMode?: string,
    blockNumber?: string,
    shardID?: number
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Passed txn ====>", transaction);
        const parsedTxn: any = await getTxnInfo(transaction);
        console.log("getTxnInfo ====>", parsedTxn);
        const res = await sendAsyncMessageToContentScript({
          hostname: window.location.hostname,
          type: "THIRDPARTY_SIGN_REQUEST",
          payload: parsedTxn,
        });
        if (res.rejected) {
          return resolve("User rejected sign transaction request");
        }

        const privateKey: any = await decryptKeyStore(
          res.password,
          res.keystore
        );
        const signer: Account = new Account(privateKey, transaction.messenger);
        let signedTransaction: any;
        if (transaction.constructor.name === Transaction.name) {
          signedTransaction = await signer.signTransaction(
            transaction as Transaction,
            updateNonce,
            encodeMode,
            blockNumber
          );
        } else if (transaction.constructor.name === StakingTransaction.name) {
          signedTransaction = await signer.signStaking(
            transaction as StakingTransaction,
            updateNonce,
            encodeMode,
            blockNumber,
            shardID
          );
        }
        resolve(signedTransaction);
      } catch (err) {
        reject(err);
      }
    });
  }
}

const walletProvider = new WalletProvider();
export default walletProvider;
