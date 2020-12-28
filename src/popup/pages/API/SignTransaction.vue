<template>
  <main class="prompt image-bg">
    <h3 class="center">Approve Transaction</h3>
    <div class="hostrow">
      <span class="host_label">{{ host }}</span>
    </div>
    <div v-if="!getLockState">
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
      <div v-if="!wallet.isLedger" class="password-content">
        <label class="input-label">
          Password
          <input
            class="input-field"
            type="password"
            name="password"
            ref="password"
            v-model="password"
            placeholder="Input your password"
            v-on:keyup.enter="approve"
          />
        </label>
      </div>
      <div class="ledger-content" v-else>
        <b>{{ caption }}</b>
      </div>
      <div class="footer">
        <div class="button-group" v-if="!wallet.isLedger">
          <button class="outline" @click="reject">Reject</button>
          <button class="primary" @click="approve" :disabled="!password">
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
      <div class="error-container">
        <p>
          Sorry. The wallet is locked. You should unlock it first in the
          extension.
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
import { fetchSuggestions } from "services/ContractService";
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
    password: "",
    type: "Send",
    hasError: false,
    caption: LEDGER_CONFIRM_PREPARE,
    privateKey: null,
    wallet: {
      isLedger: false,
      name: "",
      address: "",
    },
  }),
  computed: {
    ...mapGetters(["getLockState"]),
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
        await this.signTransaction(true);
      }
    },
  },
  methods: {
    async signTransaction(isLedger) {
      try {
        let app, signer;
        if (isLedger) {
          this.caption = LEDGER_CONFIRM_PREPARE;
          this.hasError = false;
          app = await getHarmonyApp();
        } else {
          signer = new Account(this.privateKey, this.transaction.messenger);
        }
        let signedTxParams, signedTransaction;
        const { updateNonce, encodeMode, blockNumber, shardID } = this.params;
        if (this.type === TRANSACTIONTYPE.SEND) {
          if (isLedger)
            signedTransaction = await app.signTransaction(
              this.transaction,
              this.transaction.chainId,
              this.transaction.shardID,
              this.transaction.messenger
            );
          else
            signedTransaction = await signer.signTransaction(
              this.transaction,
              updateNonce,
              encodeMode,
              blockNumber
            );
          signedTxParams = signedTransaction.txParams;
        } else {
          if (isLedger)
            signedTransaction = await app.signStakingTransaction(
              this.transaction,
              this.transaction.chainId,
              this.transaction.shardID,
              this.transaction.messenger
            );
          else
            signedTransaction = await signer.signStaking(
              this.transaction,
              updateNonce,
              encodeMode,
              blockNumber,
              shardID
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
        if (isLedger) {
          this.caption = LEDGER_CONFIRM_SUCCESS;
          this.$notify({
            group: "notify",
            type: "success",
            text: LEDGER_CONFIRM_SUCCESS,
          });
        }
        setTimeout(
          () =>
            chrome.runtime.sendMessage({
              action: THIRDPARTY_SIGNATURE_KEY_SUCCESS_RESPONSE,
              payload: {
                txParams: signedTxParams,
              },
            }),
          isLedger ? 200 : 0
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
      let privateKey;
      if (!this.password) return;
      if (!this.wallet) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Account is invalid",
        });
        return false;
      }
      privateKey = await decryptKeyStore(this.password, this.wallet.keystore);
      if (!privateKey) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Password is not correct",
        });
        return false;
      }
      this.privateKey = privateKey;

      this.$store.commit("loading", true);
      await this.signTransaction(false);
      this.$store.commit("loading", false);
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
  updated() {
    if (this.$refs.password) this.$refs.password.focus();
  },
  created() {
    chrome.runtime.sendMessage(
      { action: GET_WALLET_SERVICE_STATE },
      async ({ state } = {}) => {
        if (state && state.type && state.txnInfo && state.session) {
          const { type, txnInfo, params, session } = state;
          this.type = type;
          this.txnParams = txnInfo;
          this.params = { ...params };
          console.log(this.txnParams);
          console.log(await fetchSuggestions(this.txnParams.data));
          this.host = session.host;
          this.wallet = _.find(this.wallets.accounts, {
            address: session.account.address,
          });
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
.password-content {
  margin-bottom: 10px;
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
