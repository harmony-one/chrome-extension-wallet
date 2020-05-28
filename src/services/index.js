import { WINDOWSTATE } from "./types";
import * as frontMessages from "./frontMessages";
import { parseMessageObject } from "./msg-parser";
import { Harmony } from "@harmony-js/core";
import { Unit } from "@harmony-js/utils";
import { decryptKeyStore } from "../lib/txnService.js";

const { ChainID, ChainType } = require("@harmony-js/utils");
const GAS_PRICE = new Unit("1").asGwei().toHex();
const GAS_LIMIT = new Unit("25000").asWei().toHex();

const URL_MAINNET = `https://api.s0.t.hmny.io`;
const MAX_ATTEMPTS = process.env.MAX_ATTEMPTS;
const maxAttempts = Number(MAX_ATTEMPTS);
class ExtensionService {
  status = WINDOWSTATE.NONE;
  senderTabID = null;
  activeTransaction = null;
  transactionDetails = null;
  transactionType = null;
  signedTransaction = null;
  confirmedTransaction = null;
  transactionHash = null;
  networkConfig = null;

  harmony = new Harmony(
    // rpc url
    URL_MAINNET,
    {
      // chainType set to Harmony
      chainType: ChainType.Harmony,
      chainId: ChainID.HmyMainnet,
    }
  );

  getState = () => {
    return {
      status: this.status,
      activeTransaction: this.activeTransaction,
      transactionDetails: this.transactionDetails,
      transactionType: this.transactionType,
      networkConfig: this.networkConfig,
      transactionHash: this.transactionHash,
    };
  };
  setPopupStatus(status) {
    this.status = status;
    chrome.runtime.sendMessage({
      type: "FROM_BACK_TO_POPUP",
      action: "STATE_CHANGE",
      payload: this.getState(),
    });
  }
  closeSession() {
    chrome.tabs.query({}, (tabs) =>
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, frontMessages.closeSession());
      })
    );

    this.resetState();
  }
  resetState = () => {
    this.senderTabID = null;
    this.activeTransaction = null;
    this.signedTransaction = null;
    this.confirmedTransaction = null;
    this.transactionHash = null;
    this.setPopupStatus(WINDOWSTATE.NONE);
  };
  sendMessageToFront(messageObject) {
    chrome.tabs.sendMessage(this.senderTabID, messageObject);
  }
  startLogIn = (tabid) => {
    this.status = WINDOWSTATE.LOGIN;
    this.senderTabID = tabid;
  };
  loginWithExtension = (address) => {
    this.setPopupStatus(WINDOWSTATE.CLOSE);
    this.sendMessageToFront(frontMessages.loginResponse(address));
  };
  prepareSignTransaction = (transaction, tabid) => {
    try {
      this.senderTabID = tabid;
      this.activeTransaction = transaction;
      this.transactionDetails = parseMessageObject(transaction.signMessage);
      this.transactionType = this.transactionDetails.type;
      this.networkConfig = this.transactionDetails.network;
      this.status = WINDOWSTATE.SIGN;
      this.setPopupStatus(WINDOWSTATE.SIGN);
    } catch (err) {
      this.resetState();
    }
  };

  signTransaction = async (payload) => {
    try {
      this.setPopupStatus(WINDOWSTATE.CLOSE);
      const privateKey = await decryptKeyStore(
        payload.password,
        payload.keystore
      );
      const signer = this.harmony.wallet.addByPrivateKey(privateKey);
      let txn;

      switch (this.transactionType) {
        case "Delegate":
          await this.setSharding();
          txn = this.createDelegateTransaction();
          this.signedTransaction = await this.harmony.wallet.signStaking(
            txn,
            signer
          );
          break;

        case "Undelegate":
          await this.setSharding();
          txn = this.createUndelegateTransaction();
          this.signedTransaction = await this.harmony.wallet.signStaking(
            txn,
            signer
          );
          break;

        case "WithdrawDelegationReward":
          await this.setSharding();
          txn = this.createRewards();
          this.signedTransaction = await this.harmony.wallet.signStaking(
            txn,
            signer
          );
          break;

        case "Send":
          txn = this.createTransaction();
          this.signedTransaction = await this.harmony.wallet.signTransaction(
            txn,
            signer
          );
          break;
      }
      await this.sendTransaction(this.signedTransaction);
    } catch (err) {
      this.sendMessageToFront(frontMessages.signTransactionError(err.message));
    }
    this.resetState();
  };

  async sendTransaction(signedTransaction = this.signedTransaction) {
    let txn = null;
    try {
      const [sentTxn, txnHash] = await signedTransaction.sendTransaction();

      this.transactionHash = txnHash;
      txn = txnHash;

      this.sendMessageToFront(frontMessages.signTransaction(txnHash));
      this.confirmedTransaction = await sentTxn.confirm(txnHash, maxAttempts);
      this.sendMessageToFront(frontMessages.confirmTransaction(txnHash, []));
      this.setPopupStatus(transactionStatuses.CONFIRMED);
    } catch (err) {
      if (txn === this.transactionHash) {
        this.sendMessageToFront(
          frontMessages.confirmTransactionError(txn, err.message)
        );
        this.errorMessage = err.message;
      }
    }
  }
  createDelegateTransaction() {
    const stakingTxn = this.harmony.stakings
      .delegate({
        delegatorAddress: this.transactionDetails.delegator_address,
        validatorAddress: this.transactionDetails.validator_address,
        amount: new Unit(this.transactionDetails.subtotal).asSzabo().toHex(),
      })
      .setTxParams({
        nonce: "0x2",
        gasLimit: GAS_LIMIT,
        gasPrice: GAS_PRICE,
        chainId: this.harmony.chainId,
      })
      .build();
    return stakingTxn;
  }

  createTransaction() {
    const tx = this.harmony.transactions.newTx({
      from: this.activeTransaction.senderAddress,
      to: this.transactionDetails.receiverAddress,
      value: new Unit(this.transactionDetails.subtotal).asSzabo().toWei(),
      gasPrice: new Unit(this.transactionDetails.fee).asMwei().toWei(),
      gasLimit: this.transactionDetails.gas,
      shardID: 0,
      toShardID: 0,
      nonce: this.transactionDetails.nonce,
    });

    return tx;
  }

  createRewards() {
    const stakingTx = this.harmony.stakings
      .collectRewards({
        delegatorAddress: this.transactionDetails.delegator_address,
      })
      .setTxParams({
        nonce: "0x2",
        // gasPrice: '0x',
        gasLimit: GAS_LIMIT,
        gasPrice: GAS_PRICE,
        // gasLimit: new Unit(this.transactionDetails.gas).asWei().toHex(),
        chainId: this.harmony.chainId,
      })
      .build();

    return stakingTx;
  }
  createUndelegateTransaction() {
    const stakingTxn = this.harmony.stakings
      .undelegate({
        delegatorAddress: this.transactionDetails.delegator_address,
        validatorAddress: this.transactionDetails.validator_address,
        amount: new Unit(this.transactionDetails.subtotal).asSzabo().toHex(),
      })
      .setTxParams({
        nonce: "0x2",
        gasLimit: GAS_LIMIT,
        gasPrice: GAS_PRICE,
        chainId: this.harmony.chainId,
      })
      .build();

    return stakingTxn;
  }

  async setSharding() {
    const res = await this.harmony.blockchain.getShardingStructure();
    this.harmony.shardingStructures(res.result);
  }
  setNetwork(network) {
    const { rpc_url, chain_id } = network;

    this.networkConfig = network;

    this.harmony = new Harmony(
      // rpc url
      rpc_url,
      {
        // chainType set to Harmony
        chainType: ChainType.Harmony,
        chainId: chain_id,
      }
    );
  }

  resetWindowState = () => {
    this.status = WINDOWSTATE.NONE;
  };
}

const extensionService = new ExtensionService();

export default extensionService;
