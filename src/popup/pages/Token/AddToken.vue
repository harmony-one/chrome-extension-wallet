<template>
  <div>
    <app-header subtitle="Add HRC20 Token" backRoute="/tokens" />
    <main class="main">
      <div class="main-logo">
        <img src="images/harmony.png" alt="Harmony" />
      </div>
      <div class="addtoken-header">
        <h4>Add Token to the {{ network.name }}</h4>
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
      <label class="input-label">
        Token Symbol
        <input
          class="input-field symbol-input"
          type="text"
          name="symbol"
          ref="symbol"
          @keydown.space.prevent
          v-model="symbol"
          placeholder="Input the token symbol"
        />
      </label>
      <label class="input-label">
        Decimals of Precision
        <input
          class="input-field"
          type="number"
          name="precision"
          ref="precision"
          v-model="precision"
          placeholder="Input the decimals of precision"
          v-on:keyup.enter="createToken"
        />
      </label>
      <div class="button-group">
        <button class="outline" @click="$router.go(-1)">Back</button>
        <button @click="createToken" :disabled="!precision || !symbol || !contractAddress">Add</button>
      </div>
      <notifications group="notify" width="250" :max="2" class="notifiaction-container" />
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { HarmonyAddress } from "@harmony-js/crypto";
import {
  getTokenSymbol,
  getTokenDecimals,
  getContractInstance,
} from "../../../services/Hrc20Service";
import token from "../../mixins/token";
export default {
  data: () => ({
    symbol: "",
    contractAddress: "",
    precision: 0,
    selectedNetwork: null,
  }),
  mixins: [token],
  watch: {
    async contractAddress() {
      if (this.isValidAddress(this.contractAddress)) {
        try {
          const symbol = await getTokenSymbol(this.contractAddress);
          if (!symbol) throw new Error("Symbol not found");
          const precision = await getTokenDecimals(this.contractAddress);
          this.symbol = symbol;
          this.precision = precision;
        } catch (err) {
          this.symbol = "";
          this.precision = 0;
        }
      }
    },
  },
  methods: {
    isValidAddress(address) {
      try {
        if (HarmonyAddress.isValidBasic(new HarmonyAddress(address).basic))
          return true;
        return false;
      } catch (err) {
        return false;
      }
    },
    async isContractExist(address) {
      try {
        const symbol = await getTokenSymbol(address);
        if (!symbol) throw new Error("Symbol not found");
        await getTokenDecimals(address);
        return true;
      } catch (err) {
        return false;
      }
    },
    async createToken() {
      try {
        if (!this.isValidAddress(this.contractAddress)) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Contract address is invalid",
          });
          return;
        }
        const isContractExist = await this.isContractExist(
          this.contractAddress
        );
        if (!isContractExist) {
          this.$notify({
            group: "notify",
            type: "error",
            text: `Contract is not found in the ${this.network.name}`,
          });
          return;
        }
        if (this.getContractAddressList.includes(this.contractAddress)) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Token is already added",
          });
          return;
        }
        this.$store.commit("hrc20/addToken", {
          address: this.contractAddress,
          symbol: this.symbol,
          network: this.network.name,
          decimals: this.precision,
        });
        this.$router.push("/tokens");
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>
<style>
.addtoken-header {
  text-align: center;
}
</style>
