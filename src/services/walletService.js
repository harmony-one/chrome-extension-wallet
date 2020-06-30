import { getHarmony } from "../lib/txnService";
import { STAKINGTYPE, TRANSACTIONCLASS, TRANSACTIONTYPE } from "./types";
import { Unit } from "@harmony-js/utils";
import { StakingFactory } from "@harmony-js/staking";
import { HarmonyAddress, BN } from "@harmony-js/crypto";
class WalletService {
  activeTxn = null;
  signedTxn = null;
  txnInfo = null;
  type = null;
  parseTransactionObject = (txn) => {
    const harmony = getHarmony();
    try {
      if (txn.type === TRANSACTIONCLASS.TRANSACTION) {
        let txnParams = txn.txnInfo;
        this.activeTxn = harmony.transactions.newTx();
        this.type = TRANSACTIONTYPE.SEND;
        txnParams.gasLimit = new BN(txn.txnInfo.gasLimit);
        txnParams.gasPrice = new BN(txn.txnInfo.gasPrice);
        txnParams.value = new BN(txn.txnInfo.value);
        this.activeTxn.setParams(txnParams);
        this.txnInfo = {
          from: new HarmonyAddress(txnParams.from).bech32,
          to: new HarmonyAddress(txnParams.to).bech32,
          gasLimit: Unit.Wei(txnParams.gasLimit).toGwei(),
          amount: Unit.Wei(txnParams.value).toEther(),
        };
      } else if (txn.type === TRANSACTIONCLASS.STAKINGTRANSACTION) {
        console.log("txn.txnInfo", txn.txnInfo);
        const stakeMsg = txn.txnInfo.stakeMsg;
        if (txn.txnInfo.directive === STAKINGTYPE.DELEGATE) {
          this.type = TRANSACTIONTYPE.DELEGATE;
          this.activeTxn = new StakingFactory(harmony.messenger)
            .delegate({
              delegatorAddress: new HarmonyAddress(stakeMsg.delegatorAddress)
                .checksum,
              validatorAddress: new HarmonyAddress(stakeMsg.validatorAddress)
                .checksum,
              amount: stakeMsg.amount,
            })
            .setTxParams({
              gasPrice: txn.txnInfo.gasPrice,
              gasLimit: txn.txnInfo.gasLimit,
              chainId: txn.txnInfo.chainId,
            })
            .build();
          if (txn.txnInfo.from !== "0x")
            this.activeTxn.setFromAddress(
              new HarmonyAddress(txn.txnInfo.from).checksum
            );
          this.txnInfo = {
            delegatorAddress: stakeMsg.delegatorAddress,
            validatorAddress: stakeMsg.validatorAddress,
            gasLimit: txn.txnInfo.gasLimit,
            amount: txn.txnInfo.amount,
          };
          console.log("txnInfo", this.txnInfo);
          console.log("activeTxn", this.activeTxn);
        }
      }
    } catch (err) {
      console.error("parseTransactionObject ====>", err);
    }
    /*
    if (txn.stakeMsg) {
      if (txn.directive === 2) this.type = TRANSACTIONTYPE.DELEGATE;
      else if (txn.directive === 3) this.type = TRANSACTIONTYPE.UNDELEGATE;
      else if (txn.directive === 4) this.type = TRANSACTIONTYPE.WITHDRAWREWARD;
    } else {
      this.type = TRANSACTIONTYPE.SEND;
    }
    console.log("txn=====>", txn);
    this.txnInfo = {};
    try {
      switch (this.type) {
        case TRANSACTIONTYPE.SEND: {
          this.txnInfo.from = new HarmonyAddress(txn.from).bech32;
          this.txnInfo.to = new HarmonyAddress(txn.to).bech32;
          this.txnInfo.gasLimit = Unit.Wei(txn.gasLimit).toEther();
          this.txnInfo.amount = Unit.Wei(txn.value).toEther();
          console.log(this.txnInfo);
          this.activeTxn = harmony.transactions.newTx({ ...txn });
          console.log(this.activeTxn);
          break;
        }
        case TRANSACTIONTYPE.DELEGATE: {
          break;
        }
        case TRANSACTIONTYPE.UNDELEGATE: {
          break;
        }
        case TRANSACTIONTYPE.WITHDRAWREWARD: {
          break;
        }
      }
    } catch (err) {
      console.error("parseTransactionObject ====>", err);
    }*/
  };
  getState = () => {
    return {
      txnInfo: this.txnInfo,
    };
  };
  openSignTransactionPopup = () => {
    const width = 400,
      height = 580;
    chrome.windows.create({
      url: `chrome-extension://${chrome.runtime.id}/popup.html#/sign`,
      type: "panel",
      left: (screen.width - width) / 2,
      top: (screen.height - height) / 2,
      width: width,
      height: height,
    });
  };
  prepareSignTransaction = async (payload) => {
    try {
      console.log("prepareSignTransaction/payload=>", payload);
      this.parseTransactionObject(payload.transaction);
      //this.openSignTransactionPopup();
    } catch (err) {
      console.error("error ===>", err);
      this.resetState();
    }
  };
  resetState = () => {
    this.activeTxn = null;
    this.txnInfo = null;
    this.signedTxn = null;
  };
  signTransaction = async (payload) => {
    try {
      const privateKey = await decryptKeyStore(
        payload.password,
        payload.keystore
      );
      const signer = this.harmony.wallet.addByPrivateKey(privateKey);

      this.signedTxn = await getHarmony().wallet.signTransaction(
        transaction,
        signer
      );
      await this.sendTransaction(this.signedTxn);
    } catch (err) {
      //handle error
    }
  };
}
const walletService = new WalletService();

export default walletService;
