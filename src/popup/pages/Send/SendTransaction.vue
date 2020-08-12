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
              :class="{ disabled: selectedToken !== 'ONE' }"
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
              <div
                class="maximum-label"
                v-show="!loading"
              >Maximum: {{ getMaxBalance + " " + selectedToken }}</div>
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
        <h3 class="center">Approve Transaction</h3>
        <p class="addressRow">
          From
          <span class="address__name">
            {{
            compressAddress(getFromAddress)
            }}
          </span>
          of Shard
          <b>{{ fromShard }}</b>
        </p>
        <div class="transaction column">
          <div class="row">
            <img src="images/harmony-big.png" class="transaction__logo" alt />
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
        <div class="invoice-content">
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
          <b>{{ ledgerConfirmTxt }}</b>
        </div>
        <div v-if="!wallet.isLedger" class="button-group">
          <button class="outline" @click="onBackClick()">Back</button>
          <button @click="sendPayment" :disabled="!password">Approve</button>
        </div>
        <div v-else-if="ledgerError">
          <button @click="onBackClick()" class="full-but">Retry</button>
        </div>
      </div>
      <notifications group="notify" width="250" :max="4" class="notifiaction-container" />
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import {
  decryptKeyStore,
  transferOne,
  getNetworkLink
} from "../../../services/AccountService";
import { sendToken } from "../../../services/Hrc20Service";
import { isValidAddress } from "@harmony-js/utils";
import account from "../../mixins/account";
import helper from "../../mixins/helper";
import {
  signTransactionWithLedger,
  signHRCTransactionWithLedger,
  isLedgerLocked
} from "../../../services/LedgerService";
import {
  LEDGER_CONFIRM_PREPARE,
  LEDGER_CONFIRM_SUCCESS,
  LEDGER_CONFIRM_REJECT,
  LEDGER_LOCKED
} from "../../../types";

export default {
  name: "send-transaction",
  mixins: [account, helper],

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
    ledgerError: false,
    message: {
      show: false,
      type: "error",
      text: ""
    },
    ledgerConfirmTxt: LEDGER_CONFIRM_PREPARE
  }),

  computed: {
    ...mapState({
      wallet: state => state.wallets.active,
      loading: state => state.loading
    }),
    getFromAddress() {
      return this.wallet.address;
    },
    isHRCToken() {
      return this.selectedToken && this.selectedToken !== "ONE";
    },
    getGasFee() {
      return parseFloat((this.gasPrice * this.gasLimit) / Math.pow(10, 9));
    },
    getTotal() {
      if (!this.isHRCToken) return Number(this.amount) + Number(this.getGasFee);
      else return Number(this.amount);
    },
    getOneBalance() {
      return Number(this.account.balance).toFixed(9);
    },
    getMaxBalance() {
      let max;
      if (!this.isHRCToken) max = Number(this.account.balance).toFixed(9);
      else {
        max = this.getTokenBalance(this.selectedToken);
      }
      if (max === undefined) return Number(0).toFixed(6);
      return max;
    },
    getHeaderName() {
      if (this.isHRCToken) return `Send ${this.selectedToken} Token`;
      return "Send Payment";
    }
  },

  async mounted() {
    this.fromShard = this.account.shard;
    if (this.wallet.isLedger) this.refreshData();
    this.setSelectedToken();
    await this.loadBalance();
  },
  updated() {
    if (this.scene == 2) {
      if (!this.wallet.isLedger) this.$refs.password.focus();
    }
  },
  methods: {
    setGasLimit() {
      if (!this.isHRCToken) this.gasLimit = 21000;
      else this.gasLimit = 250000; //this is from the truffle-config.js
    },
    async tokenChanged() {
      this.toShard = 0;
      this.setGasLimit();
      await this.loadBalance();
    },
    setSelectedToken() {
      if (!this.isToken) {
        this.tokenList = ["ONE", ...this.tokenArray];
        this.selectedToken = "ONE";
      } else {
        this.selectedToken = this.token;
      }
      this.setGasLimit();
    },
    getString(amount) {
      return Number(amount).toFixed(6) + " " + this.selectedToken;
    },
    onMessageClick() {
      if (this.message.type == "success") window.open(this.message.text);
    },
    async loadBalance() {
      await this.loadOneBalance();
      if (this.isHRCToken) await this.loadTokenBalance(this.selectedToken);
    },
    async refreshToken() {
      await this.setSelectedToken();
      await this.loadBalance();
    },
    onBackClick() {
      this.scene = 1;
      this.ledgerError = false;
      this.ledgerConfirmTxt = LEDGER_CONFIRM_PREPARE;
      this.password = "";
    },
    initScene() {
      this.scene = 1;
      this.amount = 0;
      this.recipient = "";
      this.toShard = 0;
      this.password = "";
      this.ledgerError = false;
      this.ledgerConfirmTxt = LEDGER_CONFIRM_PREPARE;
    },
    async processLedgerTransfer() {
      try {
        let res;
        if (this.isHRCToken) {
          res = await signHRCTransactionWithLedger(
            this.address,
            this.recipient,
            this.amount,
            this.gasLimit,
            this.gasPrice,
            this.getTokenDecimals(this.selectedToken),
            this.getContractAddress(this.selectedToken)
          );
        } else {
          res = await signTransactionWithLedger(
            this.recipient,
            this.fromShard,
            this.toShard,
            this.amount,
            this.gasLimit,
            this.gasPrice
          );
        }
        if (res.success) {
          const signedTxn = res.result;
          this.ledgerConfirmTxt = LEDGER_CONFIRM_SUCCESS;
          this.$notify({
            group: "notify",
            type: "success",
            text: LEDGER_CONFIRM_SUCCESS
          });
          this.$store.commit("loading", true);
          const [sentTxn, txnHash] = await signedTxn.sendTransaction();
          const confiremdTxn = await sentTxn.confirm(txnHash);

          var explorerLink;
          if (confiremdTxn.isConfirmed()) {
            explorerLink = getNetworkLink("/tx/" + txnHash);
          } else {
            this.showErrMessage("Can not confirm transaction " + txnHash);
            return;
          }

          this.$store.commit("loading", false);
          this.showSuccessMsg(explorerLink);
          this.initScene();
          this.loadBalance();
        } else {
          this.$notify({
            group: "notify",
            type: "error",
            text: result
          });
          this.ledgerConfirmTxt = LEDGER_CONFIRM_REJECT;
          this.ledgerError = true;
        }
      } catch (err) {
        console.error(err);
        this.$store.commit("loading", false);
        this.showErrMessage(
          "Something went wrong while trying to send the payment"
        );
      }
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
      }

      this.$store.commit("loading", true);
      try {
        // use the current selected account in the Account window
        let ret;
        if (!this.isHRCToken) {
          ret = await transferOne(
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
            this.getTokenDecimals(this.selectedToken),
            privateKey,
            this.gasLimit,
            this.gasPrice,
            this.getContractAddress(this.selectedToken)
          );
        }

        this.$store.commit("loading", false);

        if (ret.result) {
          this.showSuccessMsg(ret.mesg);
        } else {
          this.showErrMessage(ret.mesg);
        }

        this.initScene();
        this.loadBalance();
      } catch (e) {
        this.$store.commit("loading", false);
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
    async showConfirmDialog() {
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

      if (!this.isHRCToken) {
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
      if (this.wallet.isLedger) {
        const isLocked = await isLedgerLocked();
        if (isLocked) {
          this.$notify({
            group: "notify",
            type: "error",
            text: LEDGER_LOCKED
          });
          return;
        }
        this.processLedgerTransfer();
      }
      this.scene = 2;
    },

    async refreshData() {
      this.message.show = false;
      this.$store.commit("loading", true);
      await this.loadShardingInfo();
      await this.refreshToken();
      this.$store.commit("loading", false);
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
}
.token,
.shard {
  width: 25%;
}
.gas-price,
.gas-limit {
  width: 32%;
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
  font-size: 1rem;
  text-align: center;
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

.invoice-content {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 14px;
}
</style>
