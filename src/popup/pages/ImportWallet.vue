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
          >
            Cancel
          </button>
          <button
            @click="importKey"
            :class="!wallets.accounts.length ? 'full-width' : ''"
          >
            Import
          </button>
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
          <span v-if="selectType !== 'keystore'">Password</span>
          <span v-else>Enter your keystore Password</span>
          <input
            class="input-field"
            type="password"
            name="password"
            ref="password"
            v-model="password"
            placeholder="Input the password"
          />
        </label>
        <div v-if="selectType !== 'keystore'">
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
        </div>
        <div class="button-group">
          <button
            class="outline"
            @click="
              () => {
                scene = 1;
              }
            "
          >
            Back
          </button>
          <button @click="importAcc" :disabled="!name">Import Account</button>
        </div>
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
import AppHeader from "../components/AppHeader.vue";
import {
  encryptKeyStore,
  validatePrivateKey,
  getAddressFromPrivateKey,
  createAccountFromMnemonic,
  decryptKeyStore,
} from "../../lib/txnService";

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
    file: null,
  }),
  components: {
    AppHeader,
  },
  computed: {
    ...mapState(["wallets"]),
  },

  methods: {
    onSelectFile(event) {
      this.file = event.target.files[0];
    },
    async importKey() {
      if (this.selectType === "key" && !validatePrivateKey(this.privateKey)) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Please enter a valid private key",
        });
        return false;
      }
      if (this.selectType === "mnemonic" && this.mnemonic === "") {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Please enter a valid mnemonic",
        });
        return false;
      }
      if (this.selectType === "keystore") {
        if (!this.file) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Please select a file",
          });
          return false;
        } else {
          const _this = this;
          await new Promise((resolve, reject) => {
            let reader = new window.FileReader();
            reader.onload = function(event) {
              try {
                _this.keyFromFile = JSON.parse(event.target.result);
                resolve();
              } catch (err) {
                _this.$notify({
                  group: "notify",
                  type: "error",
                  text: "Keystore file invalid",
                });
                return false;
              }
            };
            reader.readAsText(this.file);
          });
        }
      }
      this.scene = 2;
    },
    importAcc() {
      let wallet;
      if (this.name === "") {
        this.$notify({
          group: "notify",
          text: "Invalid account name",
        });
        return false;
      }

      if (
        this.selectType !== "keystore" &&
        this.password !== this.password_confirm
      ) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Password doesn't match",
        });
        return false;
      }

      if (this.selectType === "key") {
        const oneAddr = getAddressFromPrivateKey(this.privateKey);

        encryptKeyStore(this.password, this.privateKey).then((result) => {
          wallet = {
            name: this.name,
            address: oneAddr,
            keystore: result,
          };

          console.log("added new account through import private key", wallet);
          if (wallet.address) {
            this.$store.commit("wallets/addAccount", wallet);
            this.$router.push("/");
          }
        });
      } else if (this.selectType == "mnemonic") {
        createAccountFromMnemonic(this.name, this.mnemonic, this.password).then(
          (wallet) => {
            if (!wallet) {
              this.$notify({
                group: "notify",
                type: "error",
                text: "Mnemonic string is incorrect",
              });
              return false;
            } else {
              console.log("added new account through import mnemonic", wallet);
              this.$store.commit("wallets/addAccount", wallet);
              this.$router.push("/");
            }
          }
        );
      } else {
        decryptKeyStore(this.password, this.keyFromFile).then((result) => {
          if (!result) {
            this.$notify({
              group: "notify",
              type: "error",
              text: "Password is incorrect or keystore file is invalid",
            });
            return false;
          }

          console.log("finish decrypting", result);

          encryptKeyStore(this.password, result.privateKey).then((keystore) => {
            wallet = {
              name: this.name,
              address: result.address,
              keystore: keystore,
            };

            console.log("added new account through import keystore", wallet);
            if (wallet.address) {
              this.$store.commit("wallets/addAccount", wallet);
              this.$router.push("/");
            }
          });
        });
      }
    },
  },
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
