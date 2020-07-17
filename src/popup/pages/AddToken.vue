<template>
  <div>
    <app-header subtitle="Add HRC20 Token" />
    <main class="main">
      <div class="main-logo">
        <img src="images/harmony.png" alt="Harmony" />
      </div>
      <label class="input-label">
        Token Contract Address
        <input
          class="input-field"
          type="text"
          name="contractAddress"
          ref="contractAddress"
          v-model="contractAddress"
          placeholder="Input the token contract address"
        />
      </label>
      <div class="row">
        <label class="input-label symbol-field">
          Token Symbol
          <input
            class="input-field"
            type="text"
            name="symbol"
            ref="symbol"
            v-model="symbol"
            placeholder="Input the token symbol"
          />
        </label>
        <label class="input-label network-field">
          Network
          <select class="input-field" v-model="selectedNetwork">
            <option v-for="network in networkList" :key="network" :value="network">{{ network }}</option>
          </select>
        </label>
      </div>
      <label class="input-label">
        Decimals of Precision
        <input
          class="input-field"
          type="number"
          name="precision"
          ref="precision"
          min="1"
          max="18"
          v-model="precision"
          placeholder="Input the decimals of precision"
        />
      </label>
      <div class="button-group">
        <button class="outline" @click="$router.go(-1)">Back</button>
        <button @click="createToken" :disabled="!precision || !symbol || !contractAddress">Create</button>
      </div>
      <notifications group="notify" width="250" :max="2" class="notifiaction-container" />
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AppHeader from "../components/AppHeader.vue";
import QrcodeVue from "qrcode.vue";
import { HarmonyAddress } from "@harmony-js/crypto";
import token from "../mixins/token";
export default {
  data: () => ({
    symbol: "",
    contractAddress: "",
    precision: 0,
    selectedNetwork: null,
    networkList: ["Mainnet", "Testnet"]
  }),
  mixins: [token],
  components: {
    AppHeader
  },

  mounted() {
    this.selectedNetwork = this.networkList[0];
  },
  watch: {
    symbol() {
      this.symbol = this.symbol.replace(" ", "");
    }
  },
  methods: {
    isValidAddress(address) {
      try {
        if (HarmonyAddress.isValidChecksum(address) === true) return true;
        return false;
      } catch (err) {
        return false;
      }
    },
    createToken() {
      try {
        if (!this.isValidAddress(this.contractAddress)) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Contract address is invalid"
          });
          return;
        }
        if (this.tokenArray.includes(this.symbol)) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Token symbol already exists"
          });
          return;
        }
        const tokenList = this.tokenArray.map(elem => elem.toLowerCase());
        if (tokenList.includes(this.symbol.toLowerCase())) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Token symbol already exists"
          });
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
};
</script>

<style>
.receive-payment {
  font-size: 0.875rem;
}
.network-field {
  width: 30%;
}
.symbol-field {
  width: 70%;
  margin-right: 10px;
}
.receive-payment,
.receive-payment .input-field {
  text-align: center;
}
.address-input {
  z-index: 1;
}
</style>
