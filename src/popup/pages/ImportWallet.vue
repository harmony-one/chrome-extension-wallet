<template>
  <div>
    <app-header headerTab="create-tab" />
    <main class="main import-wallet">
      <div class="main-logo">
        <img src="images/harmony.png" alt="Harmony" />
      </div>
      <div v-if="scene === 1">
        <div class="type-row">
          <div class="row-label">Select Type</div>
          <select class="input-field type-select" v-model="selectType">
            <option value="key">Private Key</option>
            <option value="mnemonic">Mnemonic</option>
            <option value="keystore">Harmony Keystore (CLI)</option>
          </select>
        </div>
        <div v-if="selectType !== 'keystore'">
          <div v-if="selectType === 'key'">
            <label class="input-label big-label">
              Paste your private Key
              <input
                class="input-field"
                type="password"
                name="priavtekey"
                ref="priavtekey"
                v-model="privateKey"
                placeholder="Input the private key"
                v-on:keyup.enter="importKey"
              />
            </label>
          </div>
          <div v-else>
            <label class="input-label">
              Paste your Mnemonic
              <textarea
                class="input-field"
                name="mnemonic"
                ref="mnemonic"
                v-model="mnemonic"
                placeholder="Input the Mnemonic"
              />
            </label>
          </div>
        </div>
        <div v-else class="file-row">
          <input type="file" class="file-field" @change="onSelectFile" />
        </div>

        <div class="button-group">
          <button
            v-show="wallets.accounts.length > 0"
            class="outline"
            @click="$router.push('/')"
          >Cancel</button>
          <button @click="importKey" :class="!wallets.accounts.length? 'full-width' : ''">Import</button>
        </div>
      </div>
      <div v-else>
        <label class="input-label">
          Account Name
          <input
            class="input-field"
            type="text"
            name="name"
            ref="name"
            v-model="name"
            placeholder="Input the account name"
          />
        </label>

        <label class="input-label">
          Password
          <input
            class="input-field"
            type="password"
            name="password"
            ref="password"
            v-model="password"
            placeholder="Input the password"
          />
        </label>
        <label class="input-label">
          Confirm Password
          <input
            class="input-field"
            type="password"
            name="password_confirm"
            ref="password_confirm"
            v-model="password_confirm"
            placeholder="Confirm the password"
            v-on:keyup.enter="importAcc"
          />
        </label>
        <div class="button-group">
          <button class="outline" @click="() => { scene = 1 }">Back</button>
          <button @click="importAcc" :disabled="!name">Import Account</button>
        </div>
      </div>
      <notifications group="notify" width="250" :max="2" class="notifiaction-container" />
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
    name: "",
    password: "",
    password_confirm: "",
    privateKey: "",
    keyFromFile: "",
    mnemonic: "",
    scene: 1,
    selectType: "key",
    file: null
  }),
  components: {
    AppHeader
  },
  computed: {
    ...mapState(["wallets"])
  },

  methods: {
    onSelectFile(event) {
      this.file = event.target.files[0];
    },
    importKey() {
      if (this.selectType === "key" && !validatePrivateKey(this.privateKey)) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Please enter a valid private key"
        });
        return false;
      }
      if (this.selectType === "mnemonic" && this.mnemonic === "") {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Please enter a valid mnemonic"
        });
        return false;
      }
      if (this.selectType === "keystore") {
        if (!this.file) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Please select a file"
          });
        } else {
          let reader = new window.FileReader();
          reader.onload = function(event) {
            this.keyFromFile = event.target.result;
            /*
            validate the keystore file here --- only validate, we will use the keystore in the importAcc() function
            if (!isKeyStoreValid()) { this.$notify({group: "notify",type: "error",text: "Keystore file is invalid"}); }
            */
          };
          reader.readAsBinaryString(this.file);
        }
        return false;
      }
      this.scene = 2;
    },
    importAcc() {
      if (this.name === "") {
        this.$notify({
          group: "notify",
          text: "Invalid account name"
        });
        return false;
      }
      if (this.password.length < 8) {
        this.$notify({
          group: "notify",
          type: "warn",
          text: "Password must be longer than 8 characters"
        });
        return false;
      }
      if (this.password !== this.password_confirm) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Password doesn't match"
        });
        return false;
      }
      if (this.selectType === "key") {
        const address = importPriveKey(this.privateKey);
        const keystore = encryptKeyStore(
          this.password,
          this.privateKey,
          address
        );
        const wallet = {
          name: this.name,
          address,
          keystore,
          keypass: this.password
        };
        this.$store.commit("wallets/addAccount", wallet);
        this.$router.push("/");
      } else if (this.selectType == "mnemonic") {
        //Todo when you select the mnemonic
      } else {
        //Todo when you select the keystore
      }
    }
  }
};
</script>
<style scoped>
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
.import-wallet .big-label {
  font-size: 1rem;
  color: black;
}
</style>
