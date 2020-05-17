<template>
  <div>
    <app-header subtitle="Send Payment" @refresh="refreshData" />
    <main class="main page-send">
      <form
        @submit.prevent="showConfirmDialog"
        action
        method="post"
        class="auth-form"
        autocomplete="off"
      >
        <div v-show="message.show" class="message" :class="[message.type]">
          <a href="confirmation link in explorer">{{ message.text }}</a>
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
              :value="getStringFromOnes"
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
        <!-- <label class="input-label">
          From Shard
          <input class="input-field" type="number" name="from-shard" v-model="fromShard" />
        </label>-->

        <button class="button brand" type="submit">Send</button>
      </form>
    </main>

    <approve-dialog
      :fromAddr="getFromAddress"
      :toAddr="receipient"
      :subTotal="amount"
      :gasFee="getNetworkFee"
      :fromShard="fromShard"
      :toShard="toShard"
      ref="approveDialog"
      @confirmed="sendPayment"
    />
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
import ApproveDialog from "../components/ApproveDialog.vue";

export default {
  mixins: [account],

  components: {
    AppHeader,
    ApproveDialog,
  },

  data: () => ({
    amount: 0,
    fromShard: 0,
    toShard: 0,
    receipient: "",
    gasPrice: 1,
    gasLimit: 21000,
    inputData: "",
    selectedToken: false,
    message: {
      show: false,
      type: "error",
      text: "",
    },
  }),

  computed: {
    ...mapState({
      wallet: (state) => state.wallet,
    }),
    confirmDialogText() {
      return `
                    Are you sure you want to transfer
                    <div><strong>${this.amount} ${this.getTokenName(
        this.selectedToken
      )}</strong></div>
                    <div>to</div>
                    <div><strong>${this.receipient}</strong> ?</div>
                `;
    },
    getFromAddress() {
      return this.wallet.address;
    },
    getStringFromOnes() {
      return parseFloat(this.gasPrice * this.gasLimit / Math.pow(10, 9)).toFixed(6) + "ONE";
    },
    getNetworkFee() {
      return Number(0.000024); //used mockup data, need to be calculated later
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

    async loadTokens() {
      await this.loadBalance();
      this.setSelectedToken();
      this.$store.commit("loading", false);
    },

    async sendPayment() {
      const wallet = decryptKeyStore(this.wallet.keypass, this.wallet.keystore);
      if (!wallet) {
        this.message.show = true;
        this.message.type = "error";
        this.message.text =
          "Something went wrong while trying to send the payment";
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
        this.fromShard = this.account.shard
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

      this.$refs.approveDialog.showDialog();
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

    getTokenBalance(token) {
      let precision = 6;

      if (token.name !== "_") {
        precision = parseInt(this.getHRC20Details(token.name)[2]);
      }

      return this.$formatNumber(this.getTokenAmount(token.balance, precision), {
        maximumSignificantDigits: precision + 1,
      });
    },
  },
};
</script>
<style lang="css">
.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.page-send .receipient,
.page-send .amount {
  width: 75%;
  margin-right: 10px;
}
.page-send .token,
.page-send .shard {
  width: 25%;
}
.page-send .gas-price,
.page-send .gas-limit {
  width: 32%;
  margin-right: 10px;
}
.page-send .gas-one {
  width: 36%;
}
.page-send .input-data {
  height: 100px;
}
</style>
