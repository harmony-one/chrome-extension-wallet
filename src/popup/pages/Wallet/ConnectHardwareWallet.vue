<template>
  <div>
    <app-header headerTab="create-tab" />
    <main class="main connect-wallet">
      <div class="main-logo" v-if="scene !== 3">
        <img
          src="images/harmony.png"
          :class="{ 'logo-md': scene === 2 ? true : false }"
          alt="Harmony"
        />
      </div>
      <div v-if="scene === 1">
        <h3>Connect a hardware wallet</h3>
        <span class="form-label"
          >Please plug in your Ledger Nano S and open the Harmony App.</span
        >
        <div class="wallet-group">
          <button class="but-ledger" @click="connect">
            <img src="images/ledger.svg" alt="Ledger" />
          </button>
        </div>
        <div class="button-group">
          <button
            v-show="wallets.accounts.length > 0"
            class="outline"
            @click="$router.push('/home')"
          >
            Cancel
          </button>
          <button
            class="primary"
            :class="!wallets.accounts.length ? 'flex' : ''"
            @click="connect"
          >
            Connect
          </button>
        </div>
      </div>
      <div v-else-if="scene === 2">
        <h3>Create the Account</h3>
        <div>Address</div>
        <span class="address-label">{{ address }}</span>
        <label class="input-label align-left">
          Account Name
          <input
            class="input-field"
            type="text"
            name="name"
            ref="name"
            v-model="name"
            placeholder="Input the account name"
            v-on:keyup.enter="nextToPassword"
          />
        </label>
        <button
          class="primary flex mt-20"
          :disabled="!name"
          @click="nextToPassword"
        >
          Next
        </button>
      </div>
      <div v-else>
        <create-password @success="createAccount" :onBack="() => (scene = 2)" />
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
import { mapState, mapGetters } from "vuex";
import { connectLedgerApp } from "services/LedgerService";

export default {
  data: () => ({
    scene: 1,
    name: "",
    address: "",
    error: {
      show: false,
      message: "",
    },
  }),
  computed: {
    ...mapState(["wallets"]),
    ...mapGetters(["getPassword"]),
  },
  methods: {
    async nextToPassword() {
      if (this.getPassword) await this.addAcc(this.getPassword);
      else this.scene = 3;
    },
    createAccount() {
      const wallet = {
        isLedger: true,
        name: this.name,
        address: this.address,
        keystore: "",
      };

      this.$store.commit("wallets/addAccount", wallet);
      alert(
        "Your ledger account is loaded. To continue, close this tab and use the extension."
      );
      chrome.tabs.getCurrent(function(tab) {
        chrome.tabs.remove(tab.id, function() {});
      });
    },
    connect() {
      connectLedgerApp()
        .then((address) => {
          this.address = address;
          this.scene = 2;
        })
        .catch((err) => {
          this.$notify({
            group: "notify",
            type: "error",
            text: err,
          });
        });
    },
  },
};
</script>
<style scoped>
.connect-wallet {
  text-align: center;
}
.align-left {
  text-align: left;
}
.button-group {
  display: flex;
  justify-content: space-between;
}
.form-label {
  font-size: 0.8rem;
}
.address-label {
  font-size: 0.65rem;
  font-style: italic;
}
.but-ledger {
  background: white;
  padding: 2rem;
  width: 200px;
  border: 1px solid #ddd;
  border-radius: 10px;
}
.but-ledger:hover,
.but-ledger:focus {
  border-color: #0987d7;
  cursor: pointer;
}
.but-ledger:active {
  background: #f0f0f0;
}
.wallet-group {
  display: flex;
  justify-content: center;
  margin: 30px;
}
</style>
