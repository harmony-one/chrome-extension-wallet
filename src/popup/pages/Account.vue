<template>
  <div>
    <app-header @refresh="refreshAccount" headerTab="main-tab" />

    <main class="main">
      <div class="main-logo">
        <img src="images/harmony.png" class="logo-img" alt="Harmony" />
      </div>
      <div class="container">
        <div class="account-box" @click="onClickAccount()">
          <h2 class="name-label">{{ compressName(wallets.active.name) }}</h2>
          <div class="box-address">{{ compressAddress(address) }}</div>
        </div>

        <div class="box-label">Account Balance</div>

        <div class="box-balance">
          {{ $formatNumber(account.balance, { maximumSignificantDigits: 7 }) }}
          <span
            class="box-balance-code"
          >ONE</span>
        </div>

        <!-- Shard -->
        <div class="shard-box">
          <div>Shard</div>
          <select v-model="shard">
            <option
              v-for="item in account.shardArray"
              :value="item.shardID"
              :key="item.shardID"
            >{{ item.shardID }}</option>
          </select>
        </div>
        <div class="button-group">
          <button class="outline" @click="$router.push('/receive')">Receive</button>
          <button @click="$router.push('/send')">Send</button>
        </div>
        <div class="divider"></div>
      </div>
      <notifications group="copied" width="180" :max="2" class="notifiaction-container" />
    </main>
  </div>
</template>

<script>
import account from "../mixins/account";
import AppHeader from "../components/AppHeader.vue";
import MainTab from "../components/MainTab.vue";
import { mapState } from "vuex";

export default {
  mixins: [account],

  components: {
    AppHeader,
    MainTab
  },

  data: () => ({
    shard: 0
  }),

  computed: {
    ...mapState(["wallets"])
  },

  mounted() {
    if (
      typeof this.account.shard !== "undefined" ||
      this.account.shard !== null
    ) {
      this.shard = this.account.shard;
    } else {
      this.$store.commit("account/shard", 0);
      this.shard = 0;
    }

    this.loadShardingInfo();
    this.loadOneBalance();
  },

  watch: {
    shard(newValue, oldValue) {
      this.$store.commit("account/shard", newValue);
      this.loadOneBalance();
      // window.location.reload();
    }
  },

  methods: {
    onClickAccount() {
      this.$copyText(this.address).then(() => {
        this.$notify({
          group: "copied",
          type: "info",
          text: "Copied to Clipboard"
        });
      });
    },
    compressName(str) {
      if (str.length > 15)
        return (
          str.substr(0, 10) + "..." + str.substr(str.length - 5, str.length)
        );
      return str;
    },
    compressAddress(address) {
      return (
        address.substr(0, 20) +
        "..." +
        address.substr(address.length - 5, address.length)
      );
    }
  }
};
</script>
<style scoped>
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
  margin: 0.5rem;
}
.account-box {
  border-radius: 10px;
  padding: 0.5rem;
  margin: 0 3rem 0.5rem 3rem;
  word-wrap: break-word;
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
</style>
