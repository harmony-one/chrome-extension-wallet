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
        <label class="input-label symbol-label">
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
        <label class="input-label network-field">
          Network
          <select class="input-field" v-model="selectedNetwork">
            <option
              v-for="network in networkList"
              :key="network.chainId"
              :value="network.chainId"
            >{{ network.name }}</option>
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
          v-model="precision"
          placeholder="Input the decimals of precision"
          v-on:keyup.enter="createToken"
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
import Config from "../../config";
export default {
  data: () => ({
    symbol: "",
    contractAddress: "",
    precision: 0,
    selectedNetwork: null,
    networkList: [
      {
        chainId: 1,
        name: "Mainnet"
      },
      {
        chainId: 2,
        name: "Testnet"
      }
    ]
  }),
  mixins: [token],
  components: {
    AppHeader
  },

  mounted() {
    this.selectedNetwork = this.networkList[0].chainId;
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
    async createToken() {
      try {
        if (!this.isValidAddress(this.contractAddress)) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Contract address is invalid"
          });
          return;
        }
        if (this.getContractAddressList.includes(this.contractAddress)) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Contract address already exists"
          });
          return;
        }
        const tokenList = Object.keys(
          this.tokens[this.selectedNetwork]
        ).map(elem => elem.toUpperCase());
        if (tokenList.includes(this.symbol.toUpperCase())) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Token symbol already exists"
          });
          return;
        }
        this.$store.commit("hrc20/addToken", {
          address: this.contractAddress,
          symbol: this.symbol,
          network: this.selectedNetwork,
          decimals: this.precision
        });
        const networks = Config.networks;
        const networkIndex = networks.findIndex(
          network => network.chainId === this.selectedNetwork
        );
        this.$store.commit("network/change", Config.networks[networkIndex]);
        this.$router.push("/tokens");
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

.symbol-label {
  width: 70%;
  margin-right: 10px;
}

.symbol-input {
  text-transform: uppercase;
}

::placeholder {
  text-transform: none;
}

.receive-payment,
.receive-payment .input-field {
  text-align: center;
}
</style>
