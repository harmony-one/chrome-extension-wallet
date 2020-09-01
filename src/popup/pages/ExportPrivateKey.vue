<template>
  <div>
    <app-header subtitle="Export Private Key" />
    <main class="main">
      <div class="main-logo">
        <img
          :class="wallet ? `medium` : ``"
          src="images/harmony.png"
          alt="Harmony"
        />
      </div>
      <div v-if="scene === 2">
        <h3 class="center">{{ name }}</h3>
        <p class="form-info center">{{ address }}</p>
        <div class="divider"></div>
        <div class="form-info">This is your private key.</div>

        <div class="input-group">
          <textarea
            class="input-field special"
            type="text"
            v-model="wallet.privateKey"
            readonly
          ></textarea>

          <button
            class="button"
            title="Copy to clipboard"
            @click="copyToClipboard"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              class="icon"
            >
              <path
                d="M6 6V2c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h4zm2 0h4a2 2 0 0 1 2 2v4h4V2H8v4zM2 8v10h10V8H2z"
              />
            </svg>
          </button>
        </div>

        <div class="form-info">
          <p>
            <strong>Do not lose it!</strong> It can't be recovered if you lose
            it.
          </p>
          <p>
            <strong>Do not share it!</strong> Your funds will be stolen if you
            use it on a malicious site.
          </p>
          <p>
            <strong>Make a backup!</strong> Just in case your laptop is set on
            fire.
          </p>
        </div>
        <div class="button-group">
          <button class="outline" @click="onBackClick">Back</button>
          <button @click="() => $router.push('/home')">Done</button>
        </div>
      </div>

      <div v-else>
        <select v-model="selectedIndex">
          <option
            v-for="(account, index) in accounts"
            :key="index"
            :value="index"
            >{{ account.name }}</option
          >
        </select>
        <div class="form-info center">{{ getAddress }}</div>
        <div class="divider"></div>
        <h3 class="center">Show Private Keys</h3>
        <form
          @submit.prevent="submitForm"
          action
          method="post"
          class="key-form"
          autocomplete="off"
        >
          <div class="form-info">
            Please enter your password to export the private key.
          </div>
          <input
            class="input-field"
            type="password"
            name="password"
            placeholder="Password"
            v-model="password"
            v-on:keyup.enter="submitForm"
          />

          <button class="button flex" type="submit">Export</button>
        </form>
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
import { decryptKeyStore } from "../../services/AccountService";

export default {
  data: () => ({
    name: "",
    address: "",
    password: "",
    selectedIndex: 0,
    scene: 1,
    wallet: false,
  }),

  computed: {
    ...mapState({
      accounts: (state) =>
        state.wallets.accounts.filter((acc) => !acc.isLedger),
      active: (state) => state.wallets.active,
    }),
    getAddress() {
      if (this.selectedIndex < 0) {
        return false;
      }
      this.name = this.accounts[this.selectedIndex].name;
      this.address = this.accounts[this.selectedIndex].address;
      return this.address;
    },
  },
  methods: {
    onBackClick() {
      this.scene = 1;
    },
    submitForm() {
      const keystore = this.accounts[this.selectedIndex].keystore;
      if (!keystore) return false;

      decryptKeyStore(this.password, keystore).then((result) => {
        if (!result) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Password is incorrect",
          });
          return false;
        } else {
          this.wallet = { privateKey: result };
          this.scene = 2;
        }
      });
    },
    copyToClipboard() {
      this.$copyText(this.wallet.privateKey).then(() => {
        this.$notify({
          group: "notify",
          type: "info",
          text: "Copied to Clipboard",
        });
      });
    },
  },
  mounted() {
    const index = this.accounts.findIndex(
      (acc) => acc.address === this.active.address
    );
    this.selectedIndex = index;
  },
};
</script>
<style scoped>
.medium {
  height: 70px;
}
.center {
  display: flex;
  justify-content: center;
  margin-top: 5px;
  margin-bottom: 5px;
}
select {
  font-size: 1rem;
  text-align-last: center;
  width: 200px;
  height: 40px;
  border-radius: 4px;
  box-shadow: 1px 1px 4px #ddd;
  background: #fff;
  border: none;
  outline: none;
  margin: auto;
  display: flex;
  justify-content: center;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  margin-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;
}
</style>
