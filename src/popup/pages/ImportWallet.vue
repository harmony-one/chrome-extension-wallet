<template>
  <div>
    <app-header @refresh="refreshAccount" headerTab="create-tab" />
    <main class="main import-wallet">
      <div class="main-logo">
        <img src="images/harmony.png" alt="Harmony" />
      </div>
      <div v-show="error.show" class="message error">{{ error.message }}</div>
      <div class="type-row">
        <div class="row-label">Select Type</div>
        <select class="input-field type-select" v-model="selectType">
          <option value="key">Private Key</option>
          <option value="memonic">Mnemonic</option>
          <option value="keystore">Harmony Keystore (CLI)</option>
        </select>
      </div>
      <div v-if="selectType !== 'keystore'">
        <label class="input-label">
          <span v-if="selectType === 'key'">Paste your private Key</span>
          <span v-else>Paste your mnemonic</span>
          <input
            class="input-field"
            type="text"
            name="name"
            ref="name"
            v-model="privateKey"
            :placeholder="selectType === 'key' ? 'Input the private key' : 'Input the mnemonic'"
            v-on:keyup.enter="importKey"
          />
          <div class="error" v-show="showError">Password is incorrect</div>
        </label>
      </div>
      <div v-else class="file-row">
        <input type="file" class="file-field" />
      </div>
      <div class="button-group">
        <button class="outline" @click="$router.push('/')">Cancel</button>
        <button type="submit" @click="importKey">Import</button>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AppHeader from "../components/AppHeader.vue";
import {
  encryptKeyStore,
  validatePrivateKey,
  importPriveKey
} from "../../lib/keystore";

export default {
  data: () => ({
    password: "",
    privateKey: "",
    error: {
      show: false,
      message: ""
    },
    selectType: "key"
  }),
  components: {
    AppHeader
  },
  computed: mapState({
    address: state => state.wallet.address,
    keystore: state => state.wallet.keystore
  }),

  methods: {
    importKey() {
      if (this.password.length < 8) {
        this.error.show = true;
        this.error.message = "Password is not long enough";

        return false;
      }

      if (!validatePrivateKey(this.privateKey)) {
        this.error.show = true;
        this.error.message = "Please enter a valid private key";

        return false;
      }

      const address = importPriveKey(this.privateKey);
      const keystore = encryptKeyStore(this.password, this.privateKey, address);

      this.$store.commit("wallet/address", address);
      this.$store.commit("wallet/keypass", this.password);
      this.$store.commit("wallet/keystore", keystore);
      this.$router.push("/");
    }
  }
};
</script>
<style scoped>
.button-group {
  display: flex;
  justify-content: flex-end;
}
button {
  font-size: 13px;
  padding: 10px;
  font-weight: 400;
  min-width: 70px;
  width: 100px;
  margin-left: 20px;
  color: white;
  border-radius: 0.3rem;
  cursor: pointer;
  background: #0a93eb;
  transition: all 0.5s ease;
  white-space: nowrap;
  outline: none;
  border: none;
}
button:hover,
button:focus {
  background-color: #0987d7;
}
button.outline {
  background: rgba(10, 147, 235, 0.05);
  border: 2px solid #0a93eb;
  color: black;
}
button:disabled {
  background: #e0e0e0;
  color: #888;
}
.type-row {
  display: flex;
  justify-content: space-between;
}
.row-label {
  width: 35%;
  margin: auto;
  color: black;
  justify-content: center;
}
.type-select {
  width: 65%;
}
.file-field {
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: 300px;
}
.file-row {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
}
input[type="file"] {
  border: 1px solid #0a93eb;
  border-radius: 3px;
  padding: 0.5rem 1rem;
}
.import-wallet .input-label {
  font-size: 1rem;
  color: black;
  margin-bottom: 30px !important;
}
.import-wallet .input-label > input {
  margin-top: 15px !important;
}
</style>