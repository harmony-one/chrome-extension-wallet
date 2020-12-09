<template>
  <main class="prompt image-bg">
    <h3 class="center">Approve Transaction</h3>
    <div class="hostrow">
      <span class="host_label">{{ host }}</span>
    </div>
    <div v-if="!getLockState && getPassword">
      <div>
        <span class="action_caption">Signing by</span>
        <span class="sign__name">{{ wallet.name }}</span>
      </div>
      <div class="sign__address">{{ wallet.address }}</div>
      <p class="txRow">
        <span class="action_caption">{{ displayAction }}</span>
        <span v-if="type === 'SEND'">
          {{ txnParams.fromShard }} Shard -> {{ txnParams.toShard }} Shard
        </span>
      </p>
      <p class="txRow">
        <span>From</span>
        <span class="address__name">{{ txnParams.from }}</span>
      </p>
      <p class="txRow" v-if="!isWithdrawal && txnParams.to !== '0x'">
        <span>To</span>
        <span class="address__name">{{ txnParams.to }}</span>
      </p>
      <span class="action_caption">Transaction Details</span>
      <div class="invoice" :class="{ 'withdraw-section': isWithdrawal }">
        <div class="invoice__row" v-if="!isWithdrawal">
          <span>Amount</span>
          <span>{{ txnParams.amount }} ONE</span>
        </div>
        <div class="invoice__row">
          <span>Gas Price</span>
          <span>{{ txnParams.gasPrice }} Gwei</span>
        </div>
        <div class="invoice__row">
          <span>Gas Limit</span>
          <span>{{ txnParams.gasLimit }}</span>
        </div>
        <div v-if="isDataExist">
          <p class="data_caption">Data</p>
          <div class="data_content">{{ txnParams.data }}</div>
        </div>
      </div>
      <div class="ledger-content" v-if="wallet.isLedger">
        <b>{{ caption }}</b>
      </div>
      <div class="footer">
        <div class="button-group" v-if="!wallet.isLedger">
          <button class="outline" @click="reject">Reject</button>
          <button class="primary" ref="approve" @click="approve">
            Approve
          </button>
        </div>
        <div class="button-group" v-else>
          <button class="primary" v-if="!hasError" @click="reject">
            Close
          </button>
          <button class="primary" v-else @click="signwithLedger">Retry</button>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="error-container" v-if="getLockState">
        <p>
          Sorry. The wallet is locked. You should unlock it first in the
          extension.
        </p>
      </div>
      <div class="error-container" v-else-if="!getPassword">
        <p>
          Important Updates. Harmony One Wallet recently removes the password
          for <i><b>each account</b></i> and allows you to have only a
          <b>Global password</b> like Metamask. <br />You need to migrate all of
          your accounts in the previous version to the new version.<br />First,
          open your extension and follow the steps.
        </p>
      </div>
      <button class="primary flex mt-20" @click="lockReject">OK</button>
    </div>
    <notifications
      group="notify"
      width="250"
      :max="4"
      class="notifiaction-container"
    />
  </main>
</template>
<script>
import { decryptKeyStore } from "services/AccountService";
import { mapState, mapGetters } from "vuex";
import {
  createTransaction,
  createDelegateTransaction,
  createUndelegateTransaction,
  createRewardsTransaction,
} from "services/APIService";
import { Unit } from "@harmony-js/utils";
import { Account } from "@harmony-js/account";
import { getHarmonyApp } from "services/LedgerService";
import _ from "lodash";
import {
  TRANSACTIONTYPE,
  GET_WALLET_SERVICE_STATE,
  THIRDPARTY_SIGN_CONNECT,
  LEDGER_CONFIRM_SUCCESS,
  THIRDPARTY_SIGNATURE_KEY_SUCCESS_RESPONSE,
  THIRDPARTY_SIGNATURE_KEY_REJECT_RESPONSE,
  WALLET_LOCKED,
  LEDGER_CONFIRM_PREPARE,
} from "~/types";

export default {
  data: () => ({
    transaction: null,
    params: {
      updateNonce: true,
      encodeMode: "rlp",
      blockNumber: "latest",
      shardID: null,
    },
    txnParams: {
      gasLimit: null,
      gasPrice: null,
      amount: null,
      from: "",
      to: "",
      fromShard: 0,
      toShard: 0,
      data: "0x",
      chainId: 1,
      nonce: 0,
      shardID: 0,
    },
    host: "",
    type: "Send",
    hasError: false,
    caption: LEDGER_CONFIRM_PREPARE,
    wallet: {
      isLedger: false,
      name: "",
      address: "",
    },
  }),
  computed: {
    ...mapGetters(["getLockState", "getPassword"]),
    ...mapState({
      wallets: (state) => state.wallets,
    }),
    getGasFee() {
      return Unit.Gwei(
        this.txnParams.gasPrice * this.txnParams.gasLimit
      ).toOne();
    },
    getTotal() {
      return Number(this.txnParams.amount) + Number(this.txnParams.getGasFee);
    },
    isDataExist() {
      return this.txnParams.data && this.txnParams.data !== "0x";
    },
    displayAction() {
      switch (this.type) {
        case TRANSACTIONTYPE.DELEGATE:
          return "Delegating";
        case TRANSACTIONTYPE.UNDELEGATE:
          return "Undelegating";
        case TRANSACTIONTYPE.SEND:
          return "Sending";
        case TRANSACTIONTYPE.WITHDRAWREWARD:
          return "Withdrawal";
      }
    },
    isWithdrawal() {
      return this.type === TRANSACTIONTYPE.WITHDRAWREWARD;
    },
  },
  watch: {
    async transaction() {
      if (this.transaction && this.wallet.isLedger) {
        await this.signwithLedger();
      }
    },
  },
  methods: {
    async signwithLedger() {
      try {
        this.caption = LEDGER_CONFIRM_PREPARE;
        this.hasError = false;
        const app = await getHarmonyApp();
        let signedTxParams;
        if (this.type === TRANSACTIONTYPE.SEND) {
          const signedTransaction = await app.signTransaction(
            this.transaction,
            this.transaction.chainId,
            this.transaction.shardID,
            this.transaction.messenger
          );
          signedTxParams = signedTransaction.txParams;
        } else {
          const signedTransaction = await app.signStakingTransaction(
            this.transaction,
            this.transaction.chainId,
            this.transaction.shardID,
            this.transaction.messenger
          );
          const parsedTxn = JSON.parse(JSON.stringify(signedTransaction));
          signedTxParams = {
            from: parsedTxn.from,
            nonce: parsedTxn.nonce,
            unsignedRawTransaction: parsedTxn.unsignedRawTransaction,
            rawTransaction: parsedTxn.rawTransaction,
            signature: parsedTxn.signature,
          };
        }
        this.caption = LEDGER_CONFIRM_SUCCESS;
        this.$notify({
          group: "notify",
          type: "success",
          text: LEDGER_CONFIRM_SUCCESS,
        });
        setTimeout(
          () =>
            chrome.runtime.sendMessage({
              action: THIRDPARTY_SIGNATURE_KEY_SUCCESS_RESPONSE,
              payload: {
                isLedger: true,
                txParams: signedTxParams,
              },
            }),
          200
        );
      } catch (err) {
        this.hasError = true;
        this.caption = err.message;
        this.$notify({
          group: "notify",
          type: "error",
          text: err.message,
        });
      }
    },
    async approve() {
      if (!this.wallet) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Account is invalid",
        });
        return false;
      }
      chrome.runtime.sendMessage({
        action: THIRDPARTY_SIGNATURE_KEY_SUCCESS_RESPONSE,
        payload: {
          isLedger: false,
          keystore: this.wallet.keystore,
          password: this.getPassword,
        },
      });
    },

    async reject() {
      window.close();
    },
    lockReject() {
      chrome.runtime.sendMessage({
        action: THIRDPARTY_SIGNATURE_KEY_REJECT_RESPONSE,
        payload: {
          message: WALLET_LOCKED,
        },
      });
    },
  },
  mounted() {
    chrome.runtime.sendMessage(
      { action: GET_WALLET_SERVICE_STATE },
      ({ state } = {}) => {
        if (state && state.type && state.txnInfo && state.session) {
          const { type, txnInfo, params, session } = state;
          this.type = type;
          this.txnParams = txnInfo;
          this.params = { ...params };
          this.host = session.host;
          this.wallet = _.find(this.wallets.accounts, {
            address: session.accounts[0],
          });
          if (!this.wallet.isLedger) return;
          try {
            if (type === TRANSACTIONTYPE.SEND) {
              this.transaction = createTransaction(txnInfo);
            } else if (type === TRANSACTIONTYPE.DELEGATE) {
              this.transaction = createDelegateTransaction(txnInfo);
            } else if (type === TRANSACTIONTYPE.UNDELEGATE) {
              this.transaction = createUndelegateTransaction(txnInfo);
            } else {
              this.transaction = createRewardsTransaction(txnInfo);
            }
          } catch (err) {
            console.error(err);
          }
        } else {
          window.close();
        }
      }
    );
    chrome.runtime.connect({ name: THIRDPARTY_SIGN_CONNECT });
    this.$nextTick(() => this.$refs.approve.focus());
  },
};
</script>
<style scoped>
.image-bg {
  background-image: linear-gradient(
      rgba(247, 247, 255, 0.97),
      rgba(247, 247, 255, 0.97)
    ),
    url("images/harmony.png");
}
h3 {
  margin-top: 0px;
  margin-bottom: 0px;
}
.center {
  text-align: center;
}
.ledger-content {
  font-style: italic;
  text-align: center;
  margin-top: 20px;
}
.sign__name {
  font-weight: 700;
  color: #0987d7;
}
.sign__address {
  font-size: 12px;
  font-style: italic;
  color: #666;
}
.txRow {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}
.amount {
  color: #0987d7;
  cursor: pointer;
  font-weight: 700;
}
.data_caption {
  font-weight: 600;
  margin-top: 5px;
  margin-bottom: 5px;
}
.data_content {
  word-break: break-word;
  font-size: 12px;
  font-style: italic;
  height: 35px;
  overflow: auto;
}
.action_caption {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 0px;
}
.hostrow {
  margin-bottom: 10px;
  text-align: center;
  font-size: 13px;
}
.host_label {
  color: #0987d7;
}
.error-container {
  height: 360px;
}
.withdraw-section {
  margin-bottom: 80px;
}
</style>
