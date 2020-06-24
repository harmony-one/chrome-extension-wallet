<template>
  <div>
    <app-header @refresh="refreshTokens" headerTab="main-tab" />

    <main class="main page-token">
      <div v-if="!validTokens[network.name]" class="message-empty">No tokens found</div>

      <div v-else>
        <div class="token-row" v-for="token in validTokens[network.name]" :key="token">
          <span class="token-name">{{ token }}</span>
          <div class="token-box">
            <span class="token-balance">{{ tokens[token].balance }}</span>
            <button
              class="but-token"
              :disabled="
                tokens[token].balance <= 0 ||
                  tokens[token].balance === undefined
              "
              @click="sendToken(token)"
            >Send</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import token from "../mixins/token";
import AppHeader from "../components/AppHeader.vue";
import { mapState } from "vuex";
export default {
  mixins: [token],
  computed: mapState({
    network: state => state.network,
    validTokens: state => state.hrc20.validTokens
  }),
  components: {
    AppHeader
  },

  mounted() {
    this.loadTokenBalance();
  },
  methods: {
    sendToken(symbol) {
      this.$router.push({ path: `/send-token/${symbol}` });
    }
  }
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
  color: #9e9e9e;
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
</style>
