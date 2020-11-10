<template>
  <section class="account-list">
    <div
      class="account-item"
      v-for="(acc, index) in allAccounts"
      :key="index"
      :class="{ 'high-light': !isConnected(acc) }"
    >
      <div class="account-item-left">
        <div>
          <span class="account-indicator">
            {{
              compressString(acc.name, 4, 5) +
                "(" +
                compressString(acc.address, 4, 4) +
                ")"
            }}</span
          >
          <span class="connect-string">{{ connectedString(acc) }}</span>
        </div>
        <div v-if="isConnected(acc)">
          <span class="connect-but" @click="switchAcc(acc)"
            >Switch to this account</span
          >
        </div>
        <div v-else>
          <span class="connect-but" @click="connect(acc)">Connect</span>
        </div>
      </div>
      <div
        class="delete-but"
        v-if="isConnected(acc)"
        @click="
          disconnect(acc, sessions.includes(active.address) ? index : index - 1)
        "
      >
        <i class="material-icons">delete</i>
      </div>
    </div>
  </section>
</template>

<script>
import apiService from "services/APIService";
import { mapState } from "vuex";
import helper from "mixins/helper";
export default {
  props: ["sessions", "host"],
  data: () => ({}),
  computed: {
    ...mapState({
      active: (state) => state.wallets.active,
      accounts: (state) => state.wallets.accounts,
    }),
    filteredAccounts() {
      let accounts = [];
      this.sessions.forEach((session) => {
        const findByAddress = _.find(this.accounts, { address: session });
        accounts.push({
          address: findByAddress.address,
          name: findByAddress.name,
        });
      });
      return accounts;
    },
    allAccounts() {
      if (!this.sessions.includes(this.active.address)) {
        return [
          { address: this.active.address, name: this.active.name },
          ...this.filteredAccounts,
        ];
      }
      return this.filteredAccounts;
    },
  },
  mixins: [helper],
  mounted() {},
  methods: {
    disconnect(acc, index) {
      this.$modal.show("dialog", {
        text: "Are you sure you want to disconnect this account?",
        buttons: [
          {
            title: "Cancel",
            default: true,
            handler: () => {
              this.$modal.hide("dialog");
            },
          },
          {
            title: "Disconnect",
            handler: async () => {
              this.$modal.hide("dialog");
              await apiService.disconnectAccount(this.host, acc, index);
              this.$emit("refresh");
            },
          },
        ],
      });
    },
    switchAcc(acc) {},
    connect(acc) {},
    isConnected(acc) {
      if (!this.sessions.includes(acc.address)) return false;
      return true;
    },
    connectedString(acc) {
      if (acc.address === this.sessions[0]) return "Active";
      else if (!this.isConnected(acc) && acc.address === this.active.address)
        return "Not connected";
      return "";
    },
  },
};
</script>
<style lang="scss" scoped>
.account-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 5px;
  border-bottom: 1px solid #ddd;
  margin-right: 5px;
  &.high-light {
    border: 1px solid #9ad7ff;
    background: #eff7ff;
  }
}
.account-item-left {
  display: flex;
  flex-direction: column;
}
.account-indicator {
  font-weight: 700;
}
.connect-string {
  font-style: italic;
  margin-left: 3px;
  font-size: 12px;
  color: #666;
}
.account-list {
  margin-bottom: 10px;
  max-height: 250px;
  overflow: auto;
}
.connect-but {
  color: #0987d7;
  font-size: 12px;
  cursor: pointer;
}
</style>
