<template>
  <div>
    <main class="prompt">
      <div class="header-row">
        <img src="images/harmony.png" alt="Harmony" />
        <span>Harmony</span>
      </div>
      <h3>Sign in Request</h3>
      <div class="hostrow">
        <span class="host_label">{{ host }}</span>
      </div>
      <div class="account-container">
        <div v-if="!wallets.accounts.length">
          <p>
            No Accounts. You should create the account first in the extension.
          </p>
        </div>
        <div v-else-if="isOnlyLedgerAvailable">
          <p>
            The ledger account is not supported for this action at the moment.
            You should create another account in the extension.
          </p>
        </div>
        <div v-else>
          <div
            v-for="(account, index) in wallets.accounts"
            :key="index"
            @click="selectAccount(index)"
          >
            <div class="card" v-if="!account.isLedger">
              <div class="account-box" :class="{ active: selected === index }">
                <div>{{ account.name }}</div>
                <div class="account-address">{{ account.address }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="button-group"
        v-if="wallets.accounts.length && !isOnlyLedgerAvailable"
      >
        <button class="outline" @click="deny">Deny</button>
        <button :disabled="selected < 0" @click="accept">Accept</button>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import {
  THIRDPARTY_GET_ACCOUNT_CONNECT,
  GET_WALLET_SERVICE_STATE,
  THIRDPARTY_GET_ACCOUNT_SUCCESS_RESPONSE,
} from "../../types";
export default {
  data: () => ({
    selected: -1,
    host: "",
  }),
  computed: {
    ...mapState(["wallets"]),
    isOnlyLedgerAvailable() {
      if (
        this.wallets.accounts.length === 1 &&
        this.wallets.accounts[0].isLedger
      )
        return true;
      return false;
    },
  },
  mounted() {
    chrome.runtime.sendMessage(
      { action: GET_WALLET_SERVICE_STATE },
      ({ state } = {}) => {
        if (state && state.host) {
          this.host = state.host;
        } else {
          window.close();
        }
      }
    );
    chrome.runtime.connect({ name: THIRDPARTY_GET_ACCOUNT_CONNECT });
  },
  methods: {
    selectAccount(index) {
      this.selected = index;
    },
    deny() {
      window.close();
    },
    accept() {
      const account = this.wallets.accounts[this.selected];
      chrome.runtime.sendMessage({
        action: THIRDPARTY_GET_ACCOUNT_SUCCESS_RESPONSE,
        payload: {
          name: account.name,
          address: account.address,
        },
      });
    },
  },
};
</script>
<style scoped>
h3 {
  text-align: center;
  margin-bottom: 0px;
  margin-top: 0px;
}
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
.hostrow {
  margin-bottom: 10px;
  text-align: center;
  font-size: 13px;
}
.host_label {
  color: #0987d7;
}
.header-row {
  display: flex;
  justify-content: center;
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: #424242;
  margin-bottom: 10px;
}
.header-row img,
.header-row span {
  display: block;
}
.header-row img {
  margin-right: 5px;
  width: 26px;
  height: 25px;
}
</style>
