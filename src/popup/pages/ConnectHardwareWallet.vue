<template>
  <div>
    <app-header headerTab="create-tab" />
    <main class="main connect-wallet">
      <div class="main-logo">
        <img src="images/harmony.png" alt="Harmony" />
      </div>
      <h3>Connect a hardware wallet</h3>
      <span class="form-label">Select a ledger hardware wallet</span>
      <div class="wallet-group">
        <button class="but-ledger" @click="connect">
          <img src="images/ledger.svg" alt="Ledger" />
        </button>
      </div>
      <div class="button-group">
        <button
          v-show="wallets.accounts.length > 0"
          class="outline"
          @click="$router.push('/')"
        >Cancel</button>
        <button :class="!wallets.accounts.length? 'full-width' : ''" @click="connect">Connect</button>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AppHeader from "../components/AppHeader.vue";
import {
  connectLedgerApp
} from "../../lib/ledger";

export default {
  data: () => ({
    error: {
      show: false,
      message: ""
    }
  }),
  computed: {
    ...mapState(["wallets"])
  },
  components: {
    AppHeader
  },
  methods: {
    connect() {
      console.log("start connecting ledger")

      connectLedgerApp().then((address) => {

        const wallet = {
          isLedger: true,
          name: "Ledger",
          address: address,
          keystore: "",
          };

          this.$store.commit("wallets/addAccount", wallet);

          // this.$router.push("/");
          alert("Your ledger account is loaded. To continue, close this tab and use the extension");
          chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove(tab.id, function() { });
          });
          }
        );
    }
  }
};


</script>
<style scoped>
.connect-wallet {
  text-align: center;
}
.button-group {
  display: flex;
  justify-content: space-between;
}
.form-label {
  font-size: 0.8rem;
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
