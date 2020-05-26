<template>
  <div>
    <app-header headerTab="create-tab" />
    <main class="main create-wallet">
      <div v-if="scene === 1">
        <div class="main-logo">
          <img src="images/harmony.png" alt="Harmony" />
        </div>
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
            @click="$router.push('/')"
          >
            Cancel
          </button>
          <button
            @click="createName"
            :class="!wallets.accounts.length ? 'full-width' : ''"
            :disabled="!name"
          >
            Create
          </button>
        </div>
      </div>
      <div v-else>
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
          />
        </label>
        <label class="input-label">
          Seed Phrase
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
          <button @click="createAcc" :disabled="!agree">Create Account</button>
        </div>
      </div>
      <notifications
        group="error"
        width="250"
        :max="2"
        class="notifiaction-container"
      />
    </main>
  </div>
</template>

<script>
import account from "../mixins/account";
import {
  generatePhrase,
  createAccountFromMnemonic,
} from "../../lib/txnService";
import AppHeader from "../components/AppHeader.vue";
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
  }),
  computed: {
    ...mapState(["wallets"]),
  },
  components: {
    AppHeader,
  },
  methods: {
    createAcc() {
      if (this.password.length < 8) {
        this.$notify({
          group: "error",
          type: "warn",
          text: "Password must be longer than 8 characters",
        });
        return;
      } else if (this.password !== this.password_confirm) {
        this.$notify({
          group: "error",
          type: "error",
          text: "Password doesn't match",
        });
        return;
      }

      createAccountFromMnemonic(
        this.name,
        this.seed_phrase,
        this.password
      ).then((wallet) => {
        if (!wallet) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Password is incorrect or mnemonic is incorrect",
          });
          return false;
        } else {
          this.$store.commit("wallets/addAccount", {
            ...wallet,
            isLedger: false,
          });
          this.$router.push("/");
        }
      });
    },
    createName() {
      if (this.name === "") {
        this.$notify({
          group: "error",
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
.check-label {
  font-size: 0.75rem;
  margin: 0.75rem 0 1rem;
  color: #757575;
  cursor: pointer;
}
</style>
