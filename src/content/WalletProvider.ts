"use strict";
import { Transaction } from "@harmony-js/transaction";
import { Account } from "@harmony-js/account";
import { decryptKeyStore } from "../lib/txnService";
import { StakingTransaction } from "@harmony-js/staking";
import {
  THIRDPARTY_FORGET_IDENTITY_REQUEST,
  THIRDPARTY_GET_ACCOUNT_REQUEST,
} from "../types";
import { sendAsyncMessageToContentScript, getTxnInfo } from "./messageHandler";

class WalletProvider {
  isOneWallet: Boolean;
  version: any;
  constructor() {
    this.version = "1.0.0";
    this.isOneWallet = true;
  }
  async forgetIdentity() {
    return new Promise(async (resolve) => {
      await sendAsyncMessageToContentScript({
        hostname: window.location.hostname,
        type: THIRDPARTY_FORGET_IDENTITY_REQUEST,
      });
      resolve();
    });
  }
  async getAccount() {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await sendAsyncMessageToContentScript({
          hostname: window.location.hostname,
          type: THIRDPARTY_GET_ACCOUNT_REQUEST,
        });
        if (res.rejected) {
          if (res.message) return reject(res.message);
          return reject("User rejected login request");
        }
        resolve(res);
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
        const parsedTxn: any = await getTxnInfo(transaction);
        const res = await sendAsyncMessageToContentScript({
          hostname: window.location.hostname,
          type: "THIRDPARTY_SIGN_REQUEST",
          payload: parsedTxn,
        });
        if (res.rejected) {
          if (res.message) return reject(res.message);
          return reject("User rejected sign transaction request");
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
