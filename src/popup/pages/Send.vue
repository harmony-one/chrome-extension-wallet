<template>
  <div>
    <app-header subtitle="Send Payment" @refresh="refreshData" />
    <main class="main page-send">
      <div v-if="scene === 1">
        <form
          @submit.prevent="showConfirmDialog"
          action
          method="post"
          class="auth-form"
          autocomplete="off"
        >
          <div
            v-show="message.show"
            class="message"
            :class="[message.type]"
            @click="onMessageClick"
          >
            <span v-if="message.type === 'success'"
              >Transaction Sucess: Click here to see the transaction</span
            >
            <span v-else>{{ message.text }}</span>
          </div>
          <div class="row">
            <label class="input-label receipient">
              Receipient Address
              <input
                class="input-field"
                type="text"
                name="address"
                v-model="receipient"
              />
            </label>
            <label class="input-label shard">
              To Shard
              <select class="input-field" v-model="toShard">
                <option
                  v-for="shard in account.shardArray"
                  :key="shard.shardID"
                  :value="shard.shardID"
                  >{{ shard.shardID }}</option
                >
              </select>
            </label>
          </div>
          <div class="row">
            <label class="input-label amount">
              Amount
              <input
                class="input-field"
                type="number"
                name="amount"
                v-model="amount"
                step="any"
              />
            </label>
            <label class="input-label token">
              Token
              <select class="input-field" v-model="selectedToken">
                <option
                  v-for="token in account.tokens"
                  :key="token.name"
                  :value="token"
                  >{{ getTokenName(token) }}</option
                >
              </select>
            </label>
          </div>
          <div class="row">
            <label class="input-label gas-price">
              Gas Price
              <input
                class="input-field"
                type="number"
                name="gasprice"
                v-model="gasPrice"
                step="any"
              />
            </label>
            <label class="input-label gas-limit">
              Gas Limit
              <input
                class="input-field"
                type="number"
                name="gaslimit"
                v-model="gasLimit"
                placeholder="Gas Limit"
              />
            </label>
            <label class="input-label gas-one">
              &nbsp;
              <input
                class="input-field"
                type="text"
                name="gasone"
                readonly
                :value="getString(getGasFee, false)"
              />
            </label>
          </div>
          <label class="input-label">
            Input Data
            <textarea
              class="input-field input-data"
              type="textarea"
              name="inputdata"
              placeholder="Please enter hexadecimal data (optional)"
              v-model="inputData"
            />
          </label>
          <button class="full-width" type="submit">Send</button>
        </form>
      </div>
      <!-- Approve Transaction Dialog -->
      <div v-else>
        <h3 class="center">Approve Transaction</h3>
        <p class="addressRow">
          From
          <span class="address__name">{{
            compressAddress(getFromAddress)
          }}</span>
          of <b>{{ fromShard }}</b> Shard
        </p>
        <div class="transaction column">
          <div class="row">
            <img src="https://harmony.one/logo" class="transaction__logo" alt />
            <div class="transaction__meta">
              <div class="transaction__caption">
                Sending
                <b>{{ getString(amount) }}</b>
              </div>
            </div>
          </div>
          <div class="transaction__information">
            To
            <span class="address__name">{{ compressAddress(receipient) }}</span>
            of <b>{{ toShard }}</b> Shard<br />
            - (Sent via Harmony)
          </div>
        </div>
        <div class="invoice">
          <div class="invoice__row">
            <div class="invoice__rowLeft">Subtotal</div>
            <div class="invoice__rowRight">{{ getString(amount) }}</div>
          </div>
          <div class="invoice__row">
            <div class="invoice__rowLeft">Network Fee</div>
            <div class="invoice__rowRight">
              {{ getString(getGasFee) }}
            </div>
          </div>
          <div class="invoice__divider"></div>
          <div class="invoice__row">
            <div class="invoice__rowLeft">Total</div>
            <div class="invoice__rowRight">{{ getString(getTotal) }}</div>
          </div>
        </div>

        <div class="password-content">
          <label class="input-label">
            Password
            <input
              class="input-field"
              type="password"
              name="password"
              ref="password"
              v-model="password"
              placeholder="Input your password"
              v-on:keyup.enter="sendPayment"
            />
          </label>
        </div>
        <div class="button-group">
          <button
            class="outline"
            @click="
              () => {
                scene = 1;
              }
            "
          >
            Back
          </button>
          <button @click="sendPayment" :disabled="!password">Approve</button>
        </div>
      </div>
      <notifications
        group="notify"
        width="250"
        :max="4"
        class="notifiaction-container"
      />
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { decryptKeyStore, transferToken } from "../../lib/keystore";
import { getTokenAmount, getTokenRawAmount } from "../../lib/utils";
import { isValidAddress } from "@harmony-js/utils";
import API from "../../lib/api";
import account from "../mixins/account";
import AppHeader from "../components/AppHeader.vue";

export default {
  mixins: [account],

  components: {
    AppHeader,
  },

  data: () => ({
    scene: 1,
    amount: 0,
    fromShard: 0,
    toShard: 0,
    receipient: "",
    gasPrice: 1,
    gasLimit: 21000,
    inputData: "",
    selectedToken: false,
    password: "",
    message: {
      show: false,
      type: "error",
      text: "",
    },
  }),

  computed: {
    ...mapState(["wallets"]),
    getUnitName() {
      const unitName = this.getTokenName(this.selectedToken);
      if (!unitName) return "ONE";
      return unitName;
    },
    getFromAddress() {
      return this.wallets.active.address;
    },
    getGasFee() {
      return parseFloat((this.gasPrice * this.gasLimit) / Math.pow(10, 9));
    },
    getTotal() {
      return Number(this.amount) + Number(this.getGasFee);
    },
  },

  mounted() {
    this.setSelectedToken();

    if (this.account.tokens.length === 0) {
      this.loadTokens();
    }
  },

  methods: {
    setSelectedToken() {
      if (this.account.tokens.length > 0) {
        this.selectedToken = this.account.tokens[0];
      }
    },
    getString(one, addSpace = true) {
      return Number(one).toFixed(6) + (addSpace ? " " : "") + this.getUnitName;
    },
    onMessageClick() {
      if (this.message.type == "success") window.open(this.message.text);
    },
    async loadTokens() {
      await this.loadBalance();
      this.setSelectedToken();
      this.$store.commit("loading", false);
    },
    async sendPayment() {
      const wallet = decryptKeyStore(
        this.password,
        this.wallets.active.keystore
      );
      if (!wallet) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Password is not correct",
        });
        return false;
      }

      this.$store.commit("loading", true);
      let amount = this.amount;

      if (this.selectedToken.name === "_") {
        amount = getTokenAmount(this.amount);
      } else {
        amount = getTokenRawAmount(
          this.amount,
          this.getHRC20Details(this.selectedToken.name)[2]
        );
      }

      try {
        // use the current selected account in the Account window
        this.fromShard = this.account.shard;
        let ret = await transferToken(
          this.receipient,
          this.fromShard,
          this.toShard,
          amount,
          wallet.privateKey,
          this.gasLimit,
          this.gasPrice
        );

        this.$store.commit("loading", false);
        this.password = "";
        this.scene = 1;
        this.message.show = true;

        if (ret.result) {
          this.message.type = "success";
          this.message.text = ret.mesg;
        } else {
          this.message.type = "error";
          this.message.text = ret.mesg;
        }

        console.log("this.message.type ", this.message.type);
        console.log("this.message.text ", this.message.text);

        this.loadTokens();
        this.receipient = "";
        this.amount = 0;
      } catch (e) {
        this.$store.commit("loading", false);

        console.log("transfer error =", e);
        this.message.show = true;
        this.message.type = "error";
        this.message.text =
          "Something went wrong while trying to send the payment";
      }
    },

    showConfirmDialog() {
      this.message.show = false;

      if (!isValidAddress(this.receipient)) {
        this.message.show = true;
        this.message.type = "error";
        this.message.text = "Invalid recipient address";

        return false;
      }

      if (!this.selectedToken) {
        this.message.show = true;
        this.message.type = "error";
        this.message.text = "Please select token that you want to send";

        return false;
      }

      let precision = 6;

      if (this.selectedToken.name !== "_") {
        precision = parseInt(this.getHRC20Details(this.selectedToken.name)[2]);
      }

      if (
        this.amount >
        parseFloat(this.getTokenAmount(this.selectedToken.balance, precision))
      ) {
        this.message.show = true;
        this.message.type = "error";
        this.message.text = "Insufficient funds";

        return false;
      }

      if (this.amount <= 0) {
        this.message.show = true;
        this.message.type = "error";
        this.message.text = "Invalid token amount";

        return false;
      }
      this.scene = 2;
    },

    refreshData() {
      this.message.show = false;
      this.$store.commit("loading", true);
      this.loadTokens();
      this.loadShardingInfo();
    },

    getTokenName(token) {
      if (token.name === "_") {
        return "ONE";
      }

      return token.name;
    },
    /* defined but not used
    getTokenBalance(token) {
      let precision = 6;

      if (token.name !== "_") {
        precision = parseInt(this.getHRC20Details(token.name)[2]);
      }

      return this.$formatNumber(this.getTokenAmount(token.balance, precision), {
        maximumSignificantDigits: precision + 1
      });
    },*/
    compressAddress(address) {
      return (
        address.substr(0, 15) +
        "..." +
        address.substr(address.length - 5, address.length)
      );
    },
  },
};
</script>
<style scoped>
h3 {
  margin-top: 0px;
}
.receipient,
.amount {
  width: 75%;
  margin-right: 10px;
}
.token,
.shard {
  width: 25%;
}
.gas-price,
.gas-limit {
  width: 32%;
  margin-right: 10px;
}
.gas-one {
  width: 36%;
}
.input-data {
  height: 100px;
}
.password-content {
  margin-bottom: 10px;
}
.center {
  text-align: center;
}
.transaction {
  display: flex;
  padding: 12px 12px;
  background: white;
}
</style>
