<template>
  <div>
    <app-header @refresh="refreshAccount" @networkChanged="refreshAccount" headerTab="main-tab" />
    <main class="main">
      <div class="relative">
        <div class="main-logo">
          <img :src="displayMode ? 'images/ethereum.svg' : 'images/harmony-big.png'" class="logo-img" alt="Harmony" />
        </div>
        <span v-if="wallets.active.isLedger" class="ledger-badge big account-badge">Ledger</span>
      </div>
      <div class="container">
        <div class="account-container">
          <div class="account-box" @click="onClickAccount()" v-tooltip.top="'Click to copy'">
            <h2 class="name-label">{{ compressName(wallets.active.name) }}</h2>
            <div class="name-ens" v-if="ensName">{{ ensName }}</div>
            <div class="box-address">
              {{ compressAddress(displayMode ? switchToHexAddress(this.address) : this.address, 20, 5) }}
            </div>
          </div>
          <div
            class="switch-box"
            @click="switchAddress"
            v-tooltip.top="displayMode ? 'Switch to ONE Address' : 'Switch to Ethereum Address'"
          >
            <img :src="!displayMode ? 'images/ethereum.svg' : 'images/harmony.png'" height="20px" alt="Harmony" />
          </div>
        </div>

        <div class="box-label">Account Balance</div>

        <div class="box-balance">
          {{ formatBalance(account.balance, 4) }}
          <span class="box-balance-code">ONE</span>
        </div>
        <div class="box-usd-balance">
          <span v-if="!tokenPrice">---</span>
          <span v-else>≈ {{ formatBalance(getUSDBalance, 4) }}</span>
          <span class="box-usd-balance-code">USD</span>
        </div>

        <!-- Shard -->
        <div class="shard-box">
          <div>Shard</div>
          <select v-model="shard" v-tooltip.top="'Select the shards'">
            <option v-for="item in account.shardArray" :value="item.shardID" :key="item.shardID">
              {{ item.shardID }}
            </option>
          </select>
        </div>
        <div class="button-group">
          <button class="outline" @click="$router.push('/deposit')" v-tooltip.top="'Deposit token'">
            Deposit
          </button>
          <button class="primary" @click="onSendClick" v-tooltip.top="'Send token'">
            Send
          </button>
        </div>
        <div class="divider"></div>
        <!-- <div class="footer price-bar" v-if="tokenPrice">
          <marquee-text :duration="20">
            <span class="token-symbol-indicator">Harmony:</span>
            <span class="token-price-indicator">{{ tokenPrice["one"] }} USD</span>
            <span class="token-symbol-indicator">Bitcoin:</span>
            <span class="token-price-indicator">{{ tokenPrice["btc"] }} USD</span>
            <span class="token-symbol-indicator">Ethereum:</span>
            <span class="token-price-indicator">{{ tokenPrice["eth"] }} USD</span>
          </marquee-text>
        </div> -->
        <div class="footer-nomargin warning">
          This wallet is no longer maintained or supported by Harmony. 
          Please migrate your funds to Metamask. <external-link url="https://docs.harmony.one/home/network/wallets/browser-extensions-wallets/one-wallet">Instructions here</external-link>
        </div>
      </div>
      <notifications group="copied" width="180" :max="2" class="notifiaction-container" />
    </main>
  </div>
</template>

<script>
import helper from "mixins/helper";
import account from "mixins/account";
import MainTab from "components/MainTab.vue";
import { mapState } from "vuex";
import BigNumber from "bignumber.js";
import { setupENS } from "services/utils/ens";
import { oneToHexAddress } from "services/Hrc20Service";
import axios from "axios";
import ExternalLink from 'components/ExternalLink.vue';
import Terms from "components/Terms.vue";

export default {
  mixins: [account, helper],

  components: {
    MainTab,
    ExternalLink,
    Terms
  },

  data: () => ({
    shard: 0,
    switchToHexAddress: oneToHexAddress,
    tokenPrice: null,
    ensName: null,
  }),

  computed: {
    ...mapState({
      wallets: (state) => state.wallets,
      network: (state) => state.network,
      displayMode: (state) => state.settings.displayMode,
      termsAccepted: (state) => state.settings.termsAccepted
    }),
    getUSDBalance() {
      return new BigNumber(this.account.balance).multipliedBy(this.tokenPrice["one"]).toFixed();
    },
  },

  async mounted() {
    if (typeof this.account.shard !== "undefined" || this.account.shard !== null) {
      this.shard = this.account.shard;
    } else {
      this.$store.commit("account/shard", 0);
      this.shard = 0;
    }
    this.loadShardingInfo();
    this.loadOneBalance();
    this.fetchTokenPrice();
    await this.loadEns();

    if(!this.termsAccepted) {
      this.$modal.show(Terms, {
          onAccepted: ()=> {
            this.$modal.hide("termsModal");
          }
        },
        {name: "termsModal", clickToClose: false , width: "80%", height: "300px"}
      );    
    }
  },

  watch: {
    shard(newValue, oldValue) {
      this.$store.commit("account/shard", newValue);
      this.loadOneBalance();
    },
    async address() {
      await this.loadEns();
    },
  },

  methods: {
    switchAddress() {
      this.$store.commit("settings/setDisplayMode", 1 - this.displayMode);
    },
    async loadEns() {
      this.ensName = "";
      const ens = setupENS(this.network);
      this.ensName = (await ens.getName(oneToHexAddress(this.address))).name;
    },
    async fetchTokenPrice() {
      const {
        data: {
          bitcoin: { usd: btcUSD },
          ethereum: { usd: ethUSD },
          harmony: { usd: hmyUSD },
        },
      } = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,harmony&vs_currencies=usd"
      );
      this.tokenPrice = { btc: btcUSD, eth: ethUSD, one: hmyUSD };
      setTimeout(this.fetchTokenPrice, 30000);
    },
    onSendClick() {
      if (this.wallets.active.isLedger) this.openExpandPopup("/send");
      else this.$router.push("/send");
    },
    onClickAccount() {
      this.$copyText(this.displayMode ? oneToHexAddress(this.address) : this.address).then(() => {
        this.$notify({
          group: "copied",
          type: "info",
          text: "Copied to Clipboard",
        });
      });
    },
    compressName(str) {
      if (str.length > 15) return str.substr(0, 10) + "..." + str.substr(str.length - 5, str.length);
      return str;
    },
  },
};
</script>
<style lang="scss" scoped>
.shard-box {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 10px;
}
.shard-box select {
  margin-left: 20px;
}
.container {
  text-align: center;
}
.name-label {
  margin: 0.1rem;
}
.name-ens {
  font-size: 12px;
  color: rgb(99, 98, 98);
  margin: 0.1rem;
}
.account-container {
  position: relative;
  .account-box {
    border-radius: 10px;
    padding: 0.5rem;
    margin: 0 3rem 0.5rem 3rem;
    word-wrap: break-word;
    transition: box-shadow 0.5s ease;
  }
  .switch-box {
    position: absolute;
    right: 15px;
    bottom: 10px;
    width: 20px;
    align-items: center;
    cursor: pointer;
  }
}
.account-box:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}
.account-box:active {
  background: #f0f0f0;
}
.toast-container {
  border-radius: 5px;
  max-width: 200px;
}
.logo-img {
  height: 50px;
  width: 50px;
}
.account-badge {
  position: absolute;
  right: 10px;
  top: 5px;
}
.relative {
  position: relative;
  z-index: -1;
}
.price-bar {
  left: 0;
  right: 0;
  font-size: 14px;
  opacity: 1;
  animation-name: fadeInOpacity;
  animation-iteration-count: 1;
  animation-timing-function: ease-in;
  animation-duration: 2s;
}
.footer-nomargin {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 10px;
}
.footer-nomargin a {
  color: white;
  text-decoration: underline;
}

.warning {
  background-color: #dc3545; 
  color: white;
  font-size: 12px;
}

.token-symbol-indicator {
  color: black;
}

.token-price-indicator {
  font-weight: 600;
  margin-right: 2rem;
}
@keyframes fadeInOpacity {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
