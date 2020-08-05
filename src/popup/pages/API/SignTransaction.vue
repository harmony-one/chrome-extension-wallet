<template>
  <main class="prompt">
    <div class="prompt-back"></div>
    <h3 class="center">Approve Transaction</h3>
    <div class="hostrow">
      <span class="host_label">{{ host }}</span>
    </div>
    <div>
      <span class="action_caption">Signing by</span>
      <span class="sign__name">{{ wallet.name }}</span>
    </div>
    <div class="sign__address">{{ wallet.address }}</div>
    <p class="txRow">
      <span class="action_caption">{{ displayAction }}</span>
      <span v-if="type === 'SEND'"
        >{{ fromShard }} Shard -> {{ toShard }} Shard</span
      >
    </p>
    <p class="txRow">
      <span>From</span>
      <span class="address__name">{{ senderAddress }}</span>
    </p>
    <p class="txRow" v-if="!isWithdrawal">
      <span>To</span>
      <span class="address__name">{{ targetAddress }}</span>
    </p>
    <span class="action_caption">Transaction Details</span>
    <div class="invoice" :class="{ 'withdraw-section': isWithdrawal }">
      <div class="invoice__row" v-if="!isWithdrawal && !isTokenTransfer">
        <div class="invoice__rowLeft">Amount</div>
        <div class="invoice__rowRight">{{ amount }} ONE</div>
      </div>
      <div class="invoice__row">
        <div class="invoice__rowLeft">Gas Price</div>
        <div class="invoice__rowRight">{{ gasPrice }} Gwei</div>
      </div>
      <div class="invoice__row">
        <div class="invoice__rowLeft">Gas Limit</div>
        <div class="invoice__rowRight">{{ gasLimit }} Gwei</div>
      </div>
      <div v-if="isTokenTransfer">
        <p class="data_caption">Data</p>
        <div class="data_content">{{ data }}</div>
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
    <notifications
      group="notify"
      width="250"
      :max="4"
      class="notifiaction-container"
    />
  </main>
</template>
<script>
import { decryptKeyStore } from "../../../services/AccountService";
import { mapState } from "vuex";
import { Unit } from "@harmony-js/utils";
import {
  TRANSACTIONTYPE,
  GET_WALLET_SERVICE_STATE,
  THIRDPARTY_SIGN_CONNECT,
  THIRDPARTY_SIGNATURE_KEY_SUCCESS_RESPONSE,
} from "../../../types";

export default {
  data: () => ({
    gasLimit: null,
    gasPrice: null,
    amount: null,
    senderAddress: "",
    targetAddress: "",
    password: "",
    type: "Send",
    host: "",
    fromShard: false,
    toShard: false,
    data: false,
    wallet: {
      isLedger: false,
      name: "",
      address: "",
    },
  }),
  computed: {
    ...mapState(["wallets"]),
    getGasFee() {
      return Unit.Gwei(this.gasPrice * this.gasLimit).toOne();
    },
    getTotal() {
      return Number(this.amount) + Number(this.getGasFee);
    },
    isTokenTransfer() {
      return this.data && this.data !== "0x";
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
  methods: {
    async approve() {
      let privateKey;
      if (!this.wallet.isLedger) {
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
      }
      chrome.runtime.sendMessage({
        action: THIRDPARTY_SIGNATURE_KEY_SUCCESS_RESPONSE,
        payload: {
          keystore: this.wallet.keystore, //send keystore and password to the internal message handler of background.js
          password: this.password,
        },
      });
      window.close();
    },

    async reject() {
      window.close();
    },
  },
  updated() {
    if (this.$refs.password) this.$refs.password.focus();
  },
  mounted() {
    chrome.runtime.sendMessage(
      { action: GET_WALLET_SERVICE_STATE },
      ({ state } = {}) => {
        if (state && state.type && state.txnInfo && state.session) {
          this.type = state.type;
          this.senderAddress = state.txnInfo.from;
          this.targetAddress = state.txnInfo.to;
          this.gasLimit = state.txnInfo.gasLimit;
          this.gasPrice = state.txnInfo.gasPrice;
          this.amount = state.txnInfo.amount;
          if (state.type === TRANSACTIONTYPE.SEND) {
            this.fromShard = state.txnInfo.fromShard;
            this.toShard = state.txnInfo.toShard;
            this.data = state.txnInfo.data;
          }
          this.host = state.session.host;
          this.wallet = this.wallets.accounts.find(
            (acc) => acc.address === state.session.account.address
          );
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
  margin-top: 5px;
  margin-bottom: 5px;
}
.data_content {
  word-break: break-word;
  font-size: 12px;
  font-style: italic;
  height: 50px;
  overflow: auto;
  border: 1px solid #ddd;
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
.prompt-back {
  position: absolute;
  z-index: -1;
  background-image: url("./images/harmony-big.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
  background-size: 100%;
  opacity: 0.12;
  width: 100%;
  height: 100%;
}

.withdraw-section {
  margin-bottom: 70px;
}
</style>
