<template>
  <main class="prompt">
    <h3 class="center">{{ "Approve Transaction" + (wallet.isLedger ? " with Ledger" : "") }}</h3>
    <p class="action_caption">
      <b>Signing with</b>
      <span class="sign__name">{{wallet.name}}</span>
      <b>:</b>
      <span class="sign__address">{{ wallet.address }}</span>
    </p>
    <p class="txRow">
      <span class="action_caption">{{displayAction}}:</span>
    </p>
    <p class="txRow">
      From
      <span class="address__name">{{ senderAddress }}</span>
    </p>
    <p class="txRow" v-if="!isWithdrawal">
      To
      <span class="address__name">{{ targetAddress }}</span>
    </p>
    <p class="addressRow" v-else>{{ displayAction }}</p>
    <div class="invoice" v-if="!isWithdrawal">
      <div class="invoice__row">
        <div class="invoice__rowLeft">Amount</div>
        <div class="invoice__rowRight">{{ amount }} ONE</div>
      </div>
      <div class="invoice__row">
        <div class="invoice__rowLeft">Network Fee</div>
        <div class="invoice__rowRight">{{ getGasFee }} ONE</div>
      </div>
      <div class="invoice__divider"></div>
      <div class="invoice__row">
        <div class="invoice__rowLeft">Total</div>
        <div class="invoice__rowRight">{{ getTotal }} ONE</div>
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
      <b>Please unlock your ledger and confirm the transaction</b>
    </div>
    <div class="button-group">
      <button class="outline" @click="reject">Reject</button>
      <button @click="approve" :disabled="!password">Approve</button>
    </div>
    <notifications group="notify" width="250" :max="4" class="notifiaction-container" />
  </main>
</template>
<script>
import { decryptKeyStore } from "../../lib/txnService";
import { mapState } from "vuex";
import { Unit } from "@harmony-js/utils";
import { TRANSACTIONTYPE } from "../../services/types";

export default {
  data: () => ({
    gasLimit: null,
    gasPrice: null,
    amount: null,
    senderAddress: "",
    targetAddress: "",
    password: "",
    type: "Send"
  }),
  computed: {
    ...mapState({
      wallet: state => state.wallets.active
    }),
    getGasFee() {
      return Unit.Wei(this.gasPrice * this.gasLimit).toGwei();
    },
    getTotal() {
      return Number(this.amount) + Number(this.getGasFee);
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
    }
  },
  methods: {
    async approve() {
      let privateKey;
      if (!this.wallet.isLedger) {
        if (!this.password) return;
        if (!this.wallet) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Account is invalid"
          });
          return false;
        }
        privateKey = await decryptKeyStore(this.password, this.wallet.keystore);

        if (!privateKey) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Password is not correct"
          });
          return false;
        }
      } else {
        //todo approve via ledger
      }
      chrome.runtime.sendMessage({
        action: "THIRDPARTY_SIGNATURE_KEY_SUCCESS_RESPONSE",
        payload: {
          keystore: this.wallet.keystore, //send keystore and password to the internal message handler of background.js
          password: this.password
        }
      });
      window.close();
    },

    async reject() {
      window.close();
    }
  },
  updated() {
    if (this.$refs.password) this.$refs.password.focus();
  },
  mounted() {
    chrome.runtime.sendMessage(
      { action: "GET_WALLET_SERVICE_STATE" },
      ({ state } = {}) => {
        if (state && state.type && state.txnInfo) {
          this.type = state.type;
          this.senderAddress = state.txnInfo.from;
          this.targetAddress = state.txnInfo.to;
          this.gasLimit = state.txnInfo.gasLimit;
          this.gasPrice = state.txnInfo.gasPrice;
          this.amount = state.txnInfo.amount;
        }
      }
    );
    chrome.runtime.connect({ name: "THIRDPARTY_SIGN" });
  }
};
</script>
<style scoped>
h3 {
  margin-top: 0px;
}
.password-content {
  margin-bottom: 10px;
}
.center {
  text-align: center;
}
.ledger-content {
  font-style: italic;
  margin-top: 20px;
}
.sign__name {
  font-weight: 800;
  color: #0987d7;
}
.sign__address {
  font-size: 12px;
  font-style: italic;
  color: black;
}
.txRow {
  font-size: 14px;
}
.amount {
  color: #0987d7;
  cursor: pointer;
  font-weight: 700;
}
.action_caption {
  font-size: 16px;
  font-weight: 700;
}
</style>
