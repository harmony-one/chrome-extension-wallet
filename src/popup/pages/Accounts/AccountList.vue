<template>
  <section class="account-list">
    <div
      class="account-item"
      v-for="(acc, index) in allAccounts"
      :key="index"
      :class="{ 'high-light': !isConnected(acc) }"
    >
      <div class="account-item-left">
        <div class="avatar-left">
          <avatar :size="30" :username="acc.name" />
        </div>
        <div class="avatar-right">
          <div v-tooltip.top="acc.address">
            <span class="account-indicator"> {{ acc.name }}</span>
            <span class="connect-string">{{ connectedString(acc) }}</span>
          </div>
          <div v-if="isConnected(acc)">
            <span
              class="connect-but"
              v-if="!isCurrentAddress(acc)"
              @click="switchAcc(acc, isConnected(active) ? index : index - 1)"
              >Switch to this account</span
            >
          </div>
          <div v-else>
            <span class="connect-but" @click="connect(acc)">Connect</span>
          </div>
        </div>
      </div>
      <div
        class="delete-but"
        v-if="isConnected(acc)"
        @click="disconnect(acc, isConnected(active) ? index : index - 1)"
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
  props: ["host"],
  data: () => ({
    sessionAddresses: [],
  }),
  mixins: [helper],
  computed: {
    ...mapState({
      active: (state) => state.wallets.active,
      accounts: (state) => state.wallets.accounts,
    }),
    filteredAccounts() {
      let newArray = [];
      this.sessionAddresses.forEach((session) => {
        const findByAddress = _.find(this.accounts, { address: session });
        newArray.push({
          address: findByAddress.address,
          name: findByAddress.name,
        });
      });
      return newArray;
    },
    allAccounts() {
      if (!this.sessionAddresses.includes(this.active.address)) {
        return [
          { address: this.active.address, name: this.active.name },
          ...this.filteredAccounts,
        ];
      }
      return this.filteredAccounts;
    },
  },
  mounted() {
    this.sessionAddresses = this.getSessionByHost(this.host).accounts;
  },
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
              this.$store.dispatch("provider/disconnectAccount", {
                host: this.host,
                index,
              });
            },
          },
        ],
      });
    },
    switchAcc(acc, index) {
      this.$store.commit("wallets/setActive", acc.address);
      this.$store.dispatch("provider/switchAccount", {
        host: this.host,
        index,
      });
      this.$modal.hide("modal-switch-account");
    },
    connect(acc) {
      this.$store.dispatch("provider/addAccount", {
        host: this.host,
        address: acc.address,
      });
    },
    isConnected(acc) {
      if (!this.sessionAddresses.includes(acc.address)) return false;
      return true;
    },
    isCurrentAddress(acc) {
      return acc.address === this.active.address;
    },
    isActiveAddress(acc) {
      return acc.address === this.sessionAddresses[0];
    },
    connectedString(acc) {
      if (this.isActiveAddress(acc)) return "Active";
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
  word-break: break-all;
  &.high-light {
    border: 1px solid #9ad7ff;
    background: #eff7ff;
  }
}
.account-item-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  .avatar-right {
    display: flex;
    flex-direction: column;
  }
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
