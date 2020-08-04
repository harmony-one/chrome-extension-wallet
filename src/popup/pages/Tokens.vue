<template>
  <div>
    <app-header @refresh="refreshData" headerTab="main-tab" />
    <main class="main">
      <div v-if="!tokenArray || account.shard" class="message-empty">
        No tokens found
      </div>

      <div v-else>
        <div class="token-row" v-for="token in tokenArray" :key="token">
          <span class="token-name">{{ compressSymbol(token) }}</span>
          <div class="token-box">
            <span class="token-balance">{{
              $formatNumber(getTokenBalance(token), {
                maximumSignificantDigits: 6,
              })
            }}</span>
            <button
              class="but-token"
              :disabled="
                getTokenBalance(token) <= 0 ||
                  getTokenBalance(token) === undefined
              "
              @click="sendToken(token)"
            >
              Send
            </button>
          </div>
        </div>
      </div>
      <button class="add_token" @click="$router.push('/addtoken')">
        <i class="material-icons">add</i>
      </button>
    </main>
  </div>
</template>

<script>
import account from "../mixins/account";
import AppHeader from "../components/AppHeader.vue";
import { mapState } from "vuex";
export default {
  mixins: [account],
  computed: {
    ...mapState({
      account: (state) => state.account,
      network: (state) => state.network,
    }),
  },
  components: {
    AppHeader,
  },
  async mounted() {
    await this.loadAllTokenBalance();
    this.$forceUpdate();
  },
  methods: {
    compressSymbol(str) {
      if (str.length > 14)
        return (
          str.substr(0, 5) + "..." + str.substr(str.length - 5, str.length)
        );
      return str;
    },
    async refreshData() {
      await this.refreshTokens();
      await this.loadOneBalance();
    },
    sendToken(symbol) {
      this.$router.push({ path: `/send-token/${symbol}` });
    },
  },
};
</script>

<style scoped>
.token-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: #ffffff;
  border-radius: 5px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}
.token-box {
  justify-content: space-between;
  display: flex;
  align-items: center;
}
.token span {
  display: block;
}
.token-name {
  color: black;
  font-size: 0.875rem;
}
.token-balance {
  font-size: 1rem;
  font-weight: 600;
  margin-right: 10px;
  text-align: right;
  word-break: break-all;
  padding-left: 1rem;
}
.but-token {
  border-radius: 5px;
  color: black;
  width: 60px;
  background: white;
  border: 1px solid #aaa;
}
.but-token:hover:enabled {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}
.but-token:active:enabled {
  background: #f0f0f0;
}
.but-token:disabled {
  cursor: default;
  color: #ddd;
  border: 1px solid #ddd;
}
.add_token i {
  font-size: 30px;
  line-height: 40px;
  color: white;
}
</style>
