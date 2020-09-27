<template>
  <div>
    <app-header headerTab="create-tab" />
    <main class="main">
      <div class="main-logo" v-if="scene === 1 || scene === 4">
        <img src="images/harmony.png" alt="Harmony" />
      </div>
      <div v-if="scene === 1">
        <label class="input-label account-name">
          Account Name
          <input
            class="input-field"
            type="text"
            name="name"
            ref="name"
            v-model="name"
            placeholder="Input the account name"
            v-on:keyup.enter="createName"
          />
        </label>

        <div class="button-group">
          <button
            v-show="wallets.accounts.length > 0"
            class="outline"
            @click="$router.push('/home')"
          >
            Cancel
          </button>
          <button
            @click="createName"
            :class="!wallets.accounts.length ? 'flex' : ''"
            :disabled="!name"
          >
            Create
          </button>
        </div>
      </div>
      <div v-else-if="scene === 2">
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
          Confirm the password
          <input
            class="input-field"
            type="password"
            name="password_confirm"
            ref="password_confirm"
            v-model="password_confirm"
            placeholder="Confirm the password"
          />
        </label>
        <label class="input-label">
          Seed Phrase
          <a class="copy-tag" @click.prevent="copyToClipboard"
            >(Click here to copy)</a
          >
          <textarea
            class="input-field"
            name="seed_phrase"
            ref="seed_phrase"
            v-model="seed_phrase"
            placeholder="Seed Phrase"
          />
        </label>
        <input type="checkbox" id="seedcheck" :value="agree" v-model="agree" />
        <label class="check-label" for="seedcheck"
          >I understand that lost seeds cannot be recovered.</label
        >
        <div class="button-group">
          <button class="outline" @click="() => (scene = 1)">Back</button>
          <button @click="confirmPassword" :disabled="!agree">Next</button>
        </div>
      </div>
      <div v-else-if="scene === 3">
        <seed-checker :phrase="seed_phrase" :confirm="() => (scene = 4)" />
      </div>
      <div v-else>
        <pincode-modal @success="addAccount" :onBack="() => (scene = 3)" />
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
import account from "mixins/account";
import {
  generatePhrase,
  createAccountFromMnemonic,
} from "services/AccountService";
import { mapState } from "vuex";

export default {
  mixins: [account],
  data: () => ({
    name: "",
    password: "",
    agree: false,
    password_confirm: "",
    seed_phrase: "",
    scene: 1,
    wallet: null,
  }),
  computed: {
    ...mapState(["wallets"]),
  },
  methods: {
    addAccount() {
      this.$store.commit("wallets/addAccount", {
        ...this.wallet,
        isLedger: false,
      });
      alert(
        "Your account is created successfully. To continue, close this tab and use the extension."
      );
      chrome.tabs.getCurrent(function (tab) {
        chrome.tabs.remove(tab.id, function () {});
      });
    },
    async confirmPassword() {
      if (this.password.length < 8) {
        this.$notify({
          group: "notify",
          type: "warn",
          text: "Password must be longer than 8 characters",
        });
        return;
      } else if (this.password !== this.password_confirm) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Password doesn't match",
        });
        return;
      }
      this.wallet = await createAccountFromMnemonic(
        this.name,
        this.seed_phrase,
        this.password
      );
      if (!this.wallet) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Password is incorrect or mnemonic is incorrect",
        });
        return;
      }
      this.scene = 3;
    },
    copyToClipboard() {
      this.$copyText(this.seed_phrase).then(() => {
        this.$notify({
          group: "notify",
          type: "info",
          text: "Copied to Clipboard",
        });
      });
    },
    createName() {
      if (this.name === "") {
        this.$notify({
          group: "notify",
          text: "Invalid name",
        });
        return;
      }
      this.seed_phrase = generatePhrase();
      this.scene = 2;
    },
  },
};
</script>

<style scoped>
.button-group {
  margin-top: 30px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
}
.error {
  color: red;
  font-size: 10px;
  margin-top: 5px;
}
.account-name {
  font-size: 1rem;
  color: black;
  margin-bottom: 30px !important;
}
.account-name > input {
  margin-top: 15px !important;
}
.copy-tag {
  color: blue;
}
.check-label {
  font-size: 0.75rem;
  margin: 0.75rem 0 1rem;
  color: #757575;
  cursor: pointer;
}
</style>
