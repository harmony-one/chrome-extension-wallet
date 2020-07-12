<template>
  <div>
    <app-header :subtitle="getHeaderName" @refresh="refreshData" />
    <main class="main">
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
            <span
              v-if="message.type === 'success'"
            >Transaction Succeed: Click here to see the transaction</span>
            <span v-else>{{ message.text }}</span>
          </div>
          <div :class="{ row: !isToken }">
            <label class="input-label" :class="{ recipient: !isToken }">
              Recipient Address
              <input
                class="input-field"
                type="text"
                name="address"
                placeholder="Recipient Address"
                v-model="recipient"
              />
            </label>
            <label
              v-if="!isToken"
              class="input-label shard"
              :class="{disabled: selectedToken !== 'ONE'}"
            >
              To Shard
              <select
                class="input-field"
                v-model="toShard"
                :disabled="selectedToken !== 'ONE'"
              >
                <option
                  v-for="shard in account.shardArray"
                  :key="shard.shardID"
                  :value="shard.shardID"
                >{{ shard.shardID }}</option>
              </select>
            </label>
          </div>
          <div :class="{ row: !isToken }">
            <label class="input-label" :class="{ amount: !isToken }">
              Amount
              <input
                class="input-field"
                type="number"
                name="amount"
                placeholder="Amount"
                v-model="amount"
                step="any"
              />
              <div class="maximum-label">Maximum: {{ getMaxBalance + " " + selectedToken }}</div>
            </label>
            <label v-if="!isToken" class="input-label token">
              Token
              <select class="input-field" v-model="selectedToken" @change="tokenChanged()">
                <option v-for="symbol in tokenList" :key="symbol" :value="symbol">{{ symbol }}</option>
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
                placeholder="Gas Price"
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
                :value="`${getGasFee} ONE`"
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
        <h3 class="center">{{ "Approve Transaction" + (wallet.isLedger ? " on Ledger" : "") }}</h3>
        <p class="addressRow">
          From
          <span class="address__name">{{ compressAddress(getFromAddress) }}</span>
          of Shard
          <b>{{ fromShard }}</b>
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
            <span class="address__name">{{ compressAddress(recipient) }}</span>
            of Shard
            <b>{{ toShard }}</b>
          </div>
        </div>
        <div class="invoice">
          <div class="invoice__row">
            <div class="invoice__rowLeft">Subtotal</div>
            <div class="invoice__rowRight">{{ getString(amount) }}</div>
          </div>
          <div class="invoice__row">
            <div class="invoice__rowLeft">Network Fee</div>
            <div class="invoice__rowRight">{{ getGasFee + " ONE" }}</div>
          </div>
          <div class="invoice__divider"></div>
          <div class="invoice__row">
            <div class="invoice__rowLeft">Total</div>
            <div class="invoice__rowRight">{{ getString(getTotal) }}</div>
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
              v-on:keyup.enter="sendPayment"
            />
          </label>
        </div>
        <div class="ledger-content" v-else>
          <b>Please unlock your ledger and confirm the transaction</b>
        </div>
        <div class="button-group">
          <button
            class="outline"
            @click="
              () => {
                scene = 1;
              }
            "
          >Back</button>
          <button @click="sendPayment" :disabled="!password">Approve</button>
        </div>
      </div>
      <notifications group="notify" width="250" :max="4" class="notifiaction-container" />
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { decryptKeyStore, transferToken } from "../../lib/txnService";
import { sendToken } from "../../lib/contracts/token-api";
import { isValidAddress } from "@harmony-js/utils";
import account from "../mixins/account";
import AppHeader from "../components/AppHeader.vue";

export default {
  name: "send-transaction",
  mixins: [account],

  components: {
    AppHeader
  },
  props: {
    isToken: {
      type: Boolean,
      default: false
    },
    token: {
      type: String,
      default: "ONE"
    }
  },
  data: () => ({
    scene: 1,
    amount: 0,
    fromShard: 0,
    toShard: 0,
    tokenList: [],
    recipient: "",
    gasPrice: 1,
    gasLimit: 21000,
    inputData: "",
    selectedToken: "ONE",
    password: "",
    message: {
      show: false,
      type: "error",
      text: ""
    }
  }),

  computed: {
    ...mapState({
      wallet: state => state.wallets.active,
      validTokens: state => state.hrc20.validTokens
    }),
    getFromAddress() {
      return this.wallet.address;
    },
    getGasLimit() {
      if (this.selectedToken === "ONE") this.gasLimit = 21000;
      else this.gasLimit = 250000; //this is from the truffle-config.js
      return this.gasLimit;
    },
    getGasFee() {
      return parseFloat((this.gasPrice * this.gasLimit) / Math.pow(10, 9));
    },
    getTotal() {
      if (this.selectedToken === "ONE")
        return Number(this.amount) + Number(this.getGasFee);
      else return Number(this.amount);
    },
    getOneBalance() {
      return Number(this.account.balance).toFixed(9);
    },
    getMaxBalance() {
      let max;
      if (this.selectedToken === "ONE")
        max = Number(this.account.balance).toFixed(9);
      else max = this.tokens[this.selectedToken].balance;
      if (max === undefined) return Number(0).toFixed(6);
      return max;
    },
    getHeaderName() {
      if (this.isToken) return "Send Token";
      return "Send Payment";
    }
  },

  async mounted() {
    this.setSelectedToken();
    await this.loadTokenBalance();
  },
  updated() {
    if (this.scene == 2) this.$refs.password.focus();
  },
  watch: {
    selectedToken() {
      this.toShard = 0;
    }
  },
  methods: {
    tokenChanged() {
      this.gasLimit = this.getGasLimit;
    },
    setSelectedToken() {
      if (!this.isToken) {
        this.tokenList = ["ONE", ...this.validTokens[this.network.name]];
        this.selectedToken = "ONE";
      } else {
        this.selectedToken = this.token;
      }
      this.gasLimit = this.getGasLimit;
    },
    getString(amount) {
      return Number(amount).toFixed(6) + " " + this.selectedToken;
    },
    onMessageClick() {
      if (this.message.type == "success") window.open(this.message.text);
    },
    async loadBalance() {
      if (this.selectedToken !== "ONE") await this.loadTokenBalance();
      else await this.loadOneBalance();
    },
    async loadTokens() {
      await this.loadBalance();
      this.setSelectedToken();
    },
    async sendPayment() {
      let privateKey;
      if (!this.wallet.isLedger) {
        if (!this.password) return;
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
        //todo send payment on ledger
      }

      this.$store.commit("loading", true);
      try {
        // use the current selected account in the Account window
        let ret;
        if (this.selectedToken === "ONE") {
          this.fromShard = this.account.shard;
          ret = await transferToken(
            this.recipient,
            this.fromShard,
            this.toShard,
            this.amount,
            privateKey,
            this.gasLimit,
            this.gasPrice
          );
        } else {
          //token transfer part
          ret = await sendToken(
            this.address,
            this.recipient,
            this.amount,
            privateKey,
            this.gasLimit,
            this.gasPrice,
            this.tokens[this.selectedToken].artifacts
          );
        }

        this.$store.commit("loading", false);
        this.password = "";
        this.scene = 1;

        if (ret.result) {
          this.showSuccessMsg(ret.mesg);
        } else {
          this.showErrMessage(ret.mesg);
        }

        this.loadBalance();
        this.recipient = "";
        this.amount = 0;
      } catch (e) {
        this.$store.commit("loading", false);

        console.log("transfer error =", e);
        this.showErrMessage(
          "Something went wrong while trying to send the payment"
        );
      }
    },
    showSuccessMsg(msg) {
      this.message.show = true;
      this.message.type = "success";
      this.message.text = msg;
    },
    showErrMessage(err) {
      this.message.show = true;
      this.message.type = "error";
      this.message.text = err;
    },
    showConfirmDialog() {
      this.message.show = false;

      if (!isValidAddress(this.recipient)) {
        this.showErrMessage("Invalid recipient address");
        return false;
      }

      if (!this.selectedToken) {
        this.showErrMessage("Please select token that you want to send");
        return false;
      }

      if (this.amount <= 0) {
        this.showErrMessage("Invalid token amount");
        return false;
      }

      if (this.selectedToken === "ONE") {
        if (this.getTotal > this.getOneBalance) {
          this.showErrMessage("Your balance is not enough");
          return false;
        }
      } else {
        if (this.getOneBalance < this.getGasFee) {
          this.showErrMessage("Your ONE balance is not enough");
          return false;
        }
        if (this.getTotal > this.getMaxBalance) {
          this.showErrMessage("Your token balance is not enough");
          return false;
        }
      }
      this.scene = 2;
    },

    async refreshData() {
      this.message.show = false;
      this.$store.commit("loading", true);
      await this.loadShardingInfo();
      await this.loadTokens();
      this.$store.commit("loading", false);
    },

    compressAddress(address) {
      return (
        address.substr(0, 15) +
        "..." +
        address.substr(address.length - 5, address.length)
      );
    }
  }
};
</script>
<style scoped>
h3 {
  margin-top: 0px;
}
.recipient,
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
.ledger-content {
  font-style: italic;
  margin-top: 20px;
}
.maximum-label {
  color: red;
  font-size: 12px;
  font-style: italic;
  margin-top: 3px;
  margin-left: 5px;
}
.gray {
  color: #bbb;
}
</style>
