import { HARMONY_REQUEST_TYPE, HARMONY_RESPONSE_TYPE } from "../types";
import {
  TRANSACTIONTYPE,
  FACTORYTYPE,
  ONEWALLET_SERVICE_EVENT_REQUEST,
  ONEWALLET_SERVICE_EVENT_RESPONSE,
} from "../types";
import { Directive } from "@harmony-js/staking";
import { HarmonyAddress } from "@harmony-js/crypto";
import { Unit } from "@harmony-js/utils";

const unWrapMessageFromContentScript = (data: any) => data.message;
const filterExtensionMessage = (callback: any) => (message: any) => {
  if (message === undefined) return;
  const { detail } = message;
  if (!detail) return;
  if (detail.type && detail.type === HARMONY_RESPONSE_TYPE) {
    callback(detail);
  }
};

const waitForResponse = (type: any) => {
  return new Promise((resolve) => {
    const handler = filterExtensionMessage((data: any) => {
      const message = unWrapMessageFromContentScript(data);
      if (message.type === type) {
        resolve(message.payload);
      }
      window.removeEventListener(ONEWALLET_SERVICE_EVENT_RESPONSE, handler);
    });
    window.addEventListener(ONEWALLET_SERVICE_EVENT_RESPONSE, handler);
  });
};

const sendMessageToContentScript = (payload: any) => {
  window.dispatchEvent(
    new CustomEvent(ONEWALLET_SERVICE_EVENT_REQUEST, {
      detail: {
        type: HARMONY_REQUEST_TYPE,
        payload,
      },
    })
  );
};

export const sendAsyncMessageToContentScript = async (payload: any) => {
  sendMessageToContentScript(payload);
  const response: any = await waitForResponse(`${payload.type}_RESPONSE`);
  return response;
};

export const checkTransactionType = (transaction: any) => {
  if (transaction.stakeMsg && transaction.directive !== undefined)
    return FACTORYTYPE.STAKINGTRANSACTION;
  return FACTORYTYPE.TRANSACTION;
};

export const getTxnInfo = (transaction: any) =>
  new Promise((resolve, reject) => {
    let response: any;
    const txnType = checkTransactionType(transaction);
    try {
      if (txnType === FACTORYTYPE.TRANSACTION) {
        const txnParams = transaction.txParams;
        response = {
          type: TRANSACTIONTYPE.SEND,
          txnInfo: {
            from: new HarmonyAddress(txnParams.from).bech32,
            to: txnParams.to === "0x"? "0x": new HarmonyAddress(txnParams.to).bech32,
            amount: Unit.Wei(txnParams.value).toEther(),
            gasLimit: Unit.Wei(txnParams.gasLimit).toWeiString(),
            gasPrice: Unit.Wei(txnParams.gasPrice).toGwei(),
            fromShard: txnParams.shardID,
            toShard: txnParams.toShardID,
            data: txnParams.data,
            nonce: txnParams.nonce,
            chainId: transaction.chainId,
          },
        };
      } else if (txnType === FACTORYTYPE.STAKINGTRANSACTION) {
        const stakeTransaction: any = JSON.parse(JSON.stringify(transaction));
        const stakeMsg: any = stakeTransaction.stakeMsg;
        const delegatorAddress = new HarmonyAddress(stakeMsg.delegatorAddress)
          .bech32;
        const gasLimit = Unit.Wei(stakeTransaction.gasLimit).toWeiString();
        const gasPrice = Unit.Wei(stakeTransaction.gasPrice).toGwei();
        if (
          stakeTransaction.directive === Directive.DirectiveDelegate ||
          stakeTransaction.directive === Directive.DirectiveUndelegate
        ) {
          response = {
            type:
              stakeTransaction.directive === Directive.DirectiveDelegate
                ? TRANSACTIONTYPE.DELEGATE
                : TRANSACTIONTYPE.UNDELEGATE,
            txnInfo: {
              from: delegatorAddress,
              to: new HarmonyAddress(stakeMsg.validatorAddress).bech32,
              amount: Unit.Wei(stakeMsg.amount).toEther(),
              gasLimit,
              gasPrice,
              nonce: stakeTransaction.nonce,
              chainId: stakeTransaction.chainId,
              shardID: stakeTransaction.shardID,
            },
          };
        } else if (
          stakeTransaction.directive === Directive.DirectiveCollectRewards
        ) {
          response = {
            type: TRANSACTIONTYPE.WITHDRAWREWARD,
            txnInfo: {
              from: delegatorAddress,
              gasLimit,
              gasPrice,
              nonce: stakeTransaction.nonce,
              chainId: stakeTransaction.chainId,
              shardID: stakeTransaction.shardID,
            },
          };
        }
      }
      resolve(response);
    } catch (err) {
      reject(err);
    }
  });
