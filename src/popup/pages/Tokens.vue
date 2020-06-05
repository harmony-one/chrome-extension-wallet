<template>
  <div>
    <app-header @refresh="refreshAccount" headerTab="main-tab" />

    <main class="main page-token">
      <div v-if="account.tokens.length === 0" class="message-empty">No tokens found</div>

      <div v-else>
        <div
          class="token"
          v-for="token in account.tokens"
          :key="token.name"
          v-show="token.name !== '_'"
        >
          <span class="token-name">{{ token.name }}</span>
          <span class="token-balance">{{token.balance}}</span>
          <button
            v-show="token.name === 'H20'"
            class="but-token"
            @click="$router.push('/send-token')"
          >Send</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import account from "../mixins/account";
import AppHeader from "../components/AppHeader.vue";

export default {
  mixins: [account],

  components: {
    AppHeader
  },

  mounted() {
    if (this.account.tokens.length === 0) {
      this.loadBalance();
    }
  }
};
</script>

<style scoped>
.token {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: #ffffff;
  border-radius: 5px;
  padding: 1rem;
  margin-bottom: 0.75rem;
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
  text-align: right;
  word-break: break-all;
  padding-left: 1rem;
}
.but-token {
  border-radius: 5px;
  color: black;
  width: 60px;
  background: white;
  border: 1px solid #eee;
}
.but-token:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}
.but-token:active {
  background: #f0f0f0;
}
</style>
