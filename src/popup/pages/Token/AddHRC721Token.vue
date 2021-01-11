<template>
  <div>
    <app-header subtitle="Add HRC721 Token" backRoute="/hrc721tokens" />
    <main class="main">
      <div class="main-logo">
        <img src="images/harmony.png" alt="Harmony" />
      </div>
      <div class="addtoken-header">
        <h4>Add HRC721 Token to the {{ network.name }}</h4>
      </div>
      <label class="input-label">
        Contract Address
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
        <div class="label-header">
          <span>Contract Name</span>
          <clip-loader :loading="isLoading" color="#0a93eb" size="13px" />
        </div>
        <input
          class="input-field"
          type="text"
          name="name"
          ref="name"
          @keydown.space.prevent
          v-model="name"
          placeholder="Input the token name"
        />
      </label>

      <div class="button-group">
        <button class="outline" @click="$router.go(-1)">Back</button>
        <button
          class="primary"
          @click="createToken"
          :disabled="!name || !contractAddress"
        >
          Add
        </button>
      </div>
      <notifications
        group="notify"
        width="250"
        :max="2"
        class="notifiaction-container"
      />
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { HarmonyAddress } from "@harmony-js/crypto";
import { getContractName } from "services/Hrc721Service";
import token from "mixins/token";
export default {
  data: () => ({
    name: "",
    contractAddress: "",
    isLoading: false,
    selectedNetwork: null,
  }),
  mixins: [token],
  watch: {
    async contractAddress() {
      if (this.isValidAddress(this.contractAddress)) {
        try {
          this.isLoading = true;
          const name = await getContractName(this.contractAddress);
          if (!name) throw new Error("Name not found");
          this.name = name;
          this.isLoading = false;
        } catch (err) {
          this.name = "";
          this.isLoading = false;
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
        const name = await getContractName(address);
        if (!name) throw new Error("Symbol not found");
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
        if (this.getHRC721ContractAddressList.includes(this.contractAddress)) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Contract is already added",
          });
          return;
        }
        this.$store.commit("hrc721/addToken", {
          address: this.contractAddress,
          name: this.name,
          network: this.network.name,
        });
        this.$router.push("/hrc721tokens");
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.addtoken-header {
  text-align: center;
}
.label-header {
  display: flex;
  span {
    margin-right: 5px;
  }
}
.v-spinner {
  display: flex;
  align-items: center;
}
</style>
