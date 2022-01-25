<template>
  <div>
    <app-header :subtitle="getHeaderName" @refresh="refreshData" @networkChanged="refreshData" backRoute="/home" />
    <main class="main">
      <div v-if="scene === 1">
        <form @submit.prevent="showConfirmDialog" action method="post" class="send-form" autocomplete="off">
          <div v-show="message.show" class="message" :class="[message.type]" @click="onMessageClick">
            <span v-if="message.type === 'success'">Transaction Succeed: Click here to see the transaction</span>
            <span v-else>{{ message.text }}</span>
          </div>
          <div :class="{ row: !isToken }">
            <label class="input-label" :class="{ recipient: !isToken }">
              Recipient Address or HNS
              <input
                class="input-field"
                type="text"
                name="address"
                ref="address"
                placeholder="Recipient Address or HNS"
                v-model="recipient"
              />
            </label>
            <label v-if="!isToken" class="input-label shard" :class="{ disabled: isHRCToken }">
              To Shard
              <select class="input-field" v-model="toShard" :disabled="isHRCToken">
                <option v-for="shard in account.shardArray" :key="shard.shardID" :value="shard.shardID">{{
                  shard.shardID
                }}</option>
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
                ref="amount"
                step="any"
                placeholder="Amount"
                v-model="amount"
                v-on:keyup.enter="showConfirmDialog"
              />
              <div class="maximum-label" v-show="!loading" @click="setMaxBalance">
                Maximum: {{ getMaxBalance + " " + selectedToken.symbol }}
              </div>
            </label>
            <label v-if="!isToken" class="input-label token">
              Token
              <select class="input-field" v-model="selectedToken">
                <option v-for="(token, index) in tokenList" :key="index" :value="token">{{ token.symbol }}</option>
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
                ref="gasprice"
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
                ref="gaslimit"
                v-model="gasLimit"
                placeholder="Gas Limit"
              />
            </label>
            <label class="input-label gas-one">
              Gas Fee
              <input class="input-field" type="text" name="gasfee" ref="gasfee" readonly :value="`${getGasFee} ONE`" />
            </label>
          </div>
          <label class="input-label" :class="{ disabled: isHRCToken }">
            Input Data
            <textarea
              class="input-field input-data"
              type="textarea"
              name="inputdata"
              placeholder="Please enter hexadecimal data (optional)"
              v-model="inputData"
              :disabled="isHRCToken"
            />
          </label>
          <button class="primary flex" type="submit">Send</button>
        </form>
      </div>
      <!-- Approve Transaction Dialog -->
      <div v-else>
        <h3 class="center">Approve Transaction</h3>
        <p class="addressRow">
          From
          <span class="address__name">
            {{ compressAddress(getFromAddress) }}
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
            <span class="address__name" v-if="isEns">{{ ensName }}({{ compressAddress(receiver) }})</span>
            <span class="address__name" v-else>{{ compressAddress(receiver) }}</span>
            of Shard
            <b>{{ toShard }}</b>
          </div>
        </div>
        <div class="invoice-content">
          <div class="invoice">
            <div class="invoice__row">
              <span>Amount</span>
              <span>{{ getString(amount) }}</span>
            </div>
            <div class="invoice__row">
              <span>Network Fee</span>
              <span>{{ getGasFee }} ONE</span>
            </div>
            <div class="invoice__divider"></div>
            <div class="invoice__row">
              <span>Total</span>
              <span>{{ getString(getTotal) }}</span>
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
          <button @click="sendPayment" class="primary" :disabled="!password">
            Approve
          </button>
        </div>
        <div v-else class="footer">
          <button v-if="ledgerError" @click="onBackClick()" class="primary flex">
            Retry
          </button>
          <button v-else @click="onBackClick()" class="primary flex">
            Back
          </button>
        </div>
      </div>
      <notifications group="notify" width="250" :max="4" class="notifiaction-container" />
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import BigNumber from "bignumber.js";
import { decryptKeyStore, transferOne, sendTransaction } from "services/AccountService";
import { sendToken, hexToOneAddress } from "services/Hrc20Service";
import { isValidAddress } from "@harmony-js/utils";
import account from "mixins/account";
import helper from "mixins/helper";
import { setupENS, ENS_ADDRESS_TYPE, getAddressType, isNullAddress } from "services/utils/ens";
import { signTransactionWithLedger, signHRCTransactionWithLedger } from "services/LedgerService";
import { LEDGER_CONFIRM_PREPARE, LEDGER_CONFIRM_SUCCESS, LEDGER_CONFIRM_REJECT, LEDGER_LOCKED } from "../../../types";

export default {
  name: "send-transaction",
  mixins: [account, helper],

  props: {
    isToken: {
      type: Boolean,
      default: false,
    },
    token: {
      type: Object,
    },
  },
  data: () => ({
    scene: 1,
    amount: 0,
    fromShard: 0,
    toShard: 0,
    tokenList: [],
    recipient: "",
    receiver: "",
    ensName: "",
    isEns: false,
    gasPrice: 30,
    gasLimit: 25000,
    inputData: "",
    selectedToken: { symbol: "ONE", decimals: 18, isMainToken: true },
    password: "",
    ledgerError: false,
    message: {
      show: false,
      type: "error",
      text: "",
    },
    ledgerConfirmTxt: LEDGER_CONFIRM_PREPARE,
  }),

  computed: {
    ...mapState({
      wallet: (state) => state.wallets.active,
      loading: (state) => state.loading,
      network: (state) => state.network,
    }),
    getFromAddress() {
      return this.wallet.address;
    },
    isHRCToken() {
      return this.selectedToken && !this.selectedToken.isMainToken;
    },
    getGasFee() {
      return parseFloat((this.gasPrice * this.gasLimit) / Math.pow(10, 9));
    },
    getTotal() {
      if (!this.isHRCToken) return new BigNumber(this.amount).plus(this.getGasFee).toFixed(8);
      else return this.amount;
    },
    getOneBalance() {
      return new BigNumber(this.account.balance).toFixed(8);
    },
    getMaxBalance() {
      let max;
      if (!this.isHRCToken) max = new BigNumber(this.account.balance).toFixed(8);
      else {
        max = this.getTokenBalance(this.selectedToken);
      }
      if (max === undefined) return Number(0);
      return max;
    },
    getHeaderName() {
      if (this.isHRCToken) return `Send ${this.selectedToken.symbol} Token`;
      return "Send Payment";
    },
  },

  async mounted() {
    this.fromShard = this.account.shard;
    if (this.wallet.isLedger) await this.refreshData();
    else {
      this.initSelectedToken();
      await this.loadBalance();
    }
  },

  updated() {
    if (this.scene == 2) {
      if (!this.wallet.isLedger) this.$refs.password.focus();
    }
  },
  watch: {
    selectedToken() {
      this.toShard = 0;
      this.setGasLimit();
    },
    amount() {
      if (!RegExp(`^[0-9]*[.]?[0-9]{0,${Math.min(8, this.selectedToken.decimals)}}$`, "g").test(this.amount))
        this.amount = this.amount.slice(0, this.amount.length - 1);
    },
  },
  methods: {
    setMaxBalance(e) {
      e.preventDefault();
      this.amount = this.getMaxBalance;
    },
    setGasLimit() {
      if (!this.isHRCToken) this.gasLimit = 25000;
      else this.gasLimit = 250000;
    },
    initSelectedToken() {
      if (!this.isToken) {
        this.tokenList = [{ symbol: "ONE", decimals: 18, isMainToken: true }, ...this.hrc20tokenArrayOfNetwork];
        this.selectedToken = this.tokenList[0];
      } else {
        this.selectedToken = this.token;
      }
    },
    getString(amount) {
      return `${amount} ${this.selectedToken.symbol}`;
    },
    onMessageClick() {
      if (this.message.type == "success") window.open(this.message.text);
    },
    async loadBalance() {
      await this.loadOneBalance();
      await this.loadAllTokenBalance();
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
      this.receiver = "";
      this.isEns = false;
      this.ensName = "";
      this.toShard = 0;
      this.password = "";
      this.ledgerError = false;
      this.ledgerConfirmTxt = LEDGER_CONFIRM_PREPARE;
    },
    async processLedgerTransfer() {
      try {
        let signedRes;
        if (this.isHRCToken) {
          signedRes = await signHRCTransactionWithLedger(
            this.address,
            this.receiver,
            this.amount,
            this.gasLimit,
            this.gasPrice,
            this.selectedToken.decimals,
            this.selectedToken.address
          );
        } else {
          signedRes = await signTransactionWithLedger(
            this.receiver,
            this.fromShard,
            this.toShard,
            this.amount,
            this.gasLimit,
            this.gasPrice,
            this.inputData
          );
        }
        const { result, success } = signedRes;
        if (success) {
          const signedTxn = result;
          this.ledgerConfirmTxt = LEDGER_CONFIRM_SUCCESS;
          this.$notify({
            group: "notify",
            type: "success",
            text: LEDGER_CONFIRM_SUCCESS,
          });
          this.$store.commit("loading", true);
          const sendRes = await sendTransaction(signedTxn);
          this.$store.commit("loading", false);

          if (sendRes.result) {
            this.showSuccessMsg(sendRes.mesg);
          } else {
            this.showErrMessage(sendRes.mesg);
          }
          this.initScene();
          this.loadBalance();
        } else {
          this.$store.commit("loading", false);
          this.$notify({
            group: "notify",
            type: "error",
            text: result,
          });
          this.ledgerConfirmTxt = result;
          this.ledgerError = true;
        }
      } catch (err) {
        console.error(err);

        this.$store.commit("loading", false);
        this.initScene();
        this.showErrMessage(err.message);
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
            text: "Password is not correct",
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
            this.receiver,
            this.fromShard,
            this.toShard,
            this.amount,
            privateKey,
            this.gasLimit,
            this.gasPrice,
            this.inputData
          );
        } else {
          //token transfer part
          ret = await sendToken(
            this.address,
            this.receiver,
            this.amount,
            privateKey,
            this.gasLimit,
            this.gasPrice,
            this.selectedToken.decimals,
            this.selectedToken.address
          );
        }

        this.$store.commit("loading", false);

        if (ret.result) {
          this.showSuccessMsg(ret.mesg);
        } else {
          this.showErrMessage(ret.mesg);
        }

        this.initScene();
        await this.loadBalance();
      } catch (e) {
        console.error(e);
        this.$store.commit("loading", false);
        this.initScene();
        this.showErrMessage("Something went wrong while trying to send the payment");
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

      if (getAddressType(this.recipient) == ENS_ADDRESS_TYPE.ADDRESS) {
        this.receiver = this.recipient;
        this.isEns = false;
      } else if (getAddressType(this.recipient) == ENS_ADDRESS_TYPE.NAME) {
        const ens = setupENS(this.network);
        try {
          const hexAddr = await ens.name(this.recipient).getAddress();
          if (hexAddr === "0x0000000000000000000000000000000000000000")
            throw new Error("Invalid Recipient or HNS address");
          this.receiver = hexToOneAddress(hexAddr);
        } catch (error) {
          this.showErrMessage(error.message);
          return false;
        }
        this.ensName = this.recipient;
        this.isEns = true;
      } else {
        this.showErrMessage("Invalid recipient address or HNS");
        return false;
      }

      if (!isValidAddress(this.receiver)) {
        this.showErrMessage("Invalid recipient address");
        return false;
      }
      if (isNullAddress(this.receiver)) {
        this.showErrMessage("Recipient address ia a burn address");
        return false;
      }

      if (!this.selectedToken) {
        this.showErrMessage("Please select token that you want to send");
        return false;
      }

      if (this.amount <= 0) {
        this.showErrMessage("Invalid token amount");
        return false;
      } else {
        const minAmount = 1 / Math.pow(10, this.selectedToken.decimals >= 8 ? 8 : this.selectedToken.decimals);
        if (new BigNumber(this.amount).isLessThan(new BigNumber(minAmount))) {
          this.showErrMessage(`Minimum send amount is ${minAmount} ${this.selectedToken.symbol}`);
          return false;
        }
      }

      if (!this.isHRCToken) {
        if (new BigNumber(this.getTotal).isGreaterThan(new BigNumber(this.getOneBalance))) {
          this.showErrMessage("Your balance is not enough");
          return false;
        }
      } else {
        if (new BigNumber(this.getOneBalance).isLessThan(new BigNumber(this.getGasFee))) {
          this.showErrMessage("Your ONE balance is not enough");
          return false;
        }
        if (new BigNumber(this.getTotal).isGreaterThan(new BigNumber(this.getMaxBalance), 10)) {
          this.showErrMessage("Your token balance is not enough");
          return false;
        }
      }
      this.amount = new BigNumber(this.amount)
        .decimalPlaces(Number(this.selectedToken.decimals), BigNumber.ROUND_HALF_DOWN)
        .toFixed();
      if (this.wallet.isLedger) {
        this.processLedgerTransfer();
      }
      this.scene = 2;
    },

    async refreshData() {
      this.message.show = false;
      this.$store.commit("loading", true);
      await this.initSelectedToken();
      await this.loadShardingInfo();
      await this.loadBalance();
      this.$store.commit("loading", false);
    },
  },
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
