<template>
  <div>
    <main class="prompt">
      <div class="header-logo">
        <img src="images/harmony-small.png" alt="Harmony" />
        <span>Harmony</span>
      </div>
      <h3>Staking Dashboard Sign in Request</h3>
      <div class="account-container">
        <div v-if="!wallets.accounts.length">
          <p>No Accounts. You should create the account first</p>
        </div>
        <div v-else>
          <div
            v-for="(account, index) in wallets.accounts"
            :key="index"
            class="card"
            @click="selectAccount(index)"
          >
            <div class="account-box" :class="{ active: selected === index }">
              <div>{{ account.name }}</div>
              <div class="account-address">{{ account.address }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="button-group">
        <button class="outline" @click="deny">Deny</button>
        <button :disabled="selected < 0" @click="accept">Accept</button>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data: () => ({
    selected: -1,
  }),
  computed: {
    ...mapState(["wallets"]),
  },
  methods: {
    selectAccount(index) {
      this.selected = index;
    },
    deny() {
      window.close();
    },
    accept() {
      const address = this.wallets.accounts[this.selected].address;
      chrome.runtime.sendMessage({
        action: "LOGGED_IN",
        payload: address,
      });
    },
  },
};
</script>
<style scoped>
.account-container {
  padding-right: 5px;
  height: 370px;
  overflow: auto;
}
.card {
  background: white;
  color: black;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 4px 0 rgb(0, 0, 0, 0.1);
  padding: 12px 10px 16px 16px;
  margin-bottom: 8px;
  cursor: pointer;
}
.card > div {
  background: url("images/checkbox_off@2x.png") no-repeat right center/20px;
}
.card > div.active {
  background: url("images/checkbox_on@2x.png") no-repeat right center/20px;
}
.account-address {
  font-size: 11px;
}
.header-logo {
  display: flex;
  align-items: center;
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: #424242;
  margin-bottom: 20px;
}
.header-logo img,
.header-logo span {
  display: block;
}
.header-logo img {
  margin-right: 5px;
}
</style>
