<template>
  <main class="prompt">
    <h3 class="center">{{ "Approve Transaction" + (wallet.isLedger ? " on Ledger" : "") }}</h3>
    <p class="addressRow">
      From
      <span class="address__name">{{ senderAddress }}</span>
    </p>
    <div class="transaction column">
      <div class="row">
        <img src="https://harmony.one/logo" class="transaction__logo" alt />
        <div class="transaction__meta" v-if="!isWithdrawal">
          <div class="transaction__caption">
            {{ displayAction }}
            <b>{{ getDisplayedAmount(subtotal) }}</b> ONE
          </div>
        </div>
        <div class="transaction__meta" v-if="isWithdrawal">
          <div class="transaction__caption">{{ displayAction }}</div>
        </div>
      </div>
      <div class="transaction__information" v-if="!isWithdrawal">
        To
        <span class="address__name">{{ targetAddress }}</span> - (Sent via
        Harmony)
      </div>
    </div>
    <div class="invoice" v-if="!isWithdrawal">
      <div class="invoice__row">
        <div class="invoice__rowLeft">Subtotal</div>
        <div class="invoice__rowRight">{{ getDisplayedAmount(subtotal) }} ONE</div>
      </div>
      <div class="invoice__row">
        <div class="invoice__rowLeft">Network Fee</div>
        <div class="invoice__rowRight">{{ getDisplayedAmount(gas) }} ONE</div>
      </div>
      <div class="invoice__divider"></div>
      <div class="invoice__row">
        <div class="invoice__rowLeft">Total</div>
        <div class="invoice__rowRight">{{ getDisplayedAmount(subtotal + gas) }} ONE</div>
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

export default {
  data: () => ({
    subtotal: "",
    fee: "",
    total: "",
    gas: "",
    senderAddress: "",
    targetAddress: "",
    password: "",
    type: "Send",
    wallet: {
      isLedger: false
    }
  }),
  methods: {
    getDisplayedAmount(num) {
      return Number(num / 1000000).toFixed(6);
    },
    async approve() {
      let privateKey;
      if (!this.wallet.isLedger) {
        if (!this.password) return;
        if (!this.wallet) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Account is not found"
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
        action: "SIGN_TRANSACTION",
        payload: {
          keystore: this.wallet.keystore, //send keystore and password to the internal message handler of background.js
          password: this.password
        }
      });
    },

    async reject() {
      chrome.runtime.sendMessage({ action: "REJECT_TRANSACTION" });
      window.close();
    }
  },
  computed: {
    ...mapState(["wallets"]),
    displayAction() {
      switch (this.type) {
        case "Delegate":
          return "Delegating";
        case "Undelegate":
          return "Undelegating";
        case "Send":
          return "Sending";
        case "WithdrawDelegationReward":
          return "Withdrawal";
      }
    },
    isWithdrawal() {
      return this.type === "WithdrawDelegationReward";
    }
  },
  updated() {
    if (this.$refs.password) this.$refs.password.focus();
  },
  mounted() {
    chrome.runtime.sendMessage(
      { action: "GET_EXTENSION_STATE" },
      ({ state } = {}) => {
        if (state && state.activeTransaction) {
          this.senderAddress = state.activeTransaction.senderAddress;
        }
        if (state && state.transactionDetails) {
          this.targetAddress = state.transactionDetails.targetAddress;
          this.subtotal = state.transactionDetails.subtotal;
          this.fee = state.transactionDetails.fee;
          this.gas = state.transactionDetails.gas / 1000;
          this.total = state.transactionDetails.total;
          this.gas = state.transactionDetails.gas / 1000;
          this.type = state.transactionDetails.type;
        }
        this.wallet = this.wallets.accounts.find(
          account => account.address === this.senderAddress
        );
        console.log(this.wallets);
      }
    );
  }
};
</script>
<style>
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
</style>
