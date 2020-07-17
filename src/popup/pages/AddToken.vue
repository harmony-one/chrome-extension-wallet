<template>
  <div>
    <app-header subtitle="Add new Token" />
    <main class="main">
      <div class="main-logo">
        <img src="images/harmony.png" alt="Harmony" />
      </div>
      <label class="input-label">
        Token Contract Address
        <input
          class="input-field"
          type="text"
          name="address"
          ref="address"
          v-model="address"
          placeholder="Input the token contract address"
        />
      </label>

      <label class="input-label">
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
      <label class="input-label">
        Decimals of Precision
        <input
          class="input-field"
          type="number"
          name="precision"
          ref="precision"
          v-model="precision"
          placeholder="Input the decimals of precision"
        />
      </label>
      <div class="button-group">
        <button class="outline" @click="$router.go(-1)">Back</button>
        <button @click="createToken" :disabled="!precision || !symbol || !address">Create</button>
      </div>
      <notifications group="notify" width="250" :max="2" class="notifiaction-container" />
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AppHeader from "../components/AppHeader.vue";
import QrcodeVue from "qrcode.vue";

export default {
  data: () => ({
    symbol: "",
    address: "",
    precision: 0
  }),
  components: {
    AppHeader
  },
  methods: {
    createToken() {
      // this.$notify({
      //   group: "notify",
      //   type: "info",
      //   text: "Precision is invalid"
      // });
    }
  }
};
</script>

<style>
.receive-payment {
  font-size: 0.875rem;
}

.receive-payment,
.receive-payment .input-field {
  text-align: center;
}
.address-input {
  z-index: 1;
}
</style>
