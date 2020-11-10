<template>
  <section>
    <div
      class="connected-sites-container"
      v-if="domain"
      :class="{ connected: connected }"
      @click="showSwitchAccounts"
    >
      <div v-if="connected" class="wifi-icon">
        <img src="images/wifi.svg" alt="connected" />
      </div>
      <div v-else class="wifi-icon">
        <img src="images/wireless-error.svg" alt="not connected" />
      </div>
      <span v-if="connected">Connected</span>
      <span v-else>Not connected</span>
    </div>
    <switch-account v-if="domain" />
  </section>
</template>

<script>
import SwitchAccount from "./SwitchAccount";
import _ from "lodash";
import { mapState } from "vuex";
import helper from "mixins/helper";
export default {
  data: () => ({
    domain: "",
  }),
  mixins: [helper],
  components: {
    SwitchAccount,
  },
  computed: {
    ...mapState({
      active: (state) => state.wallets.active,
    }),
    connected() {
      if (!this.domain) return false;
      const findbyAddress = this.sessions.filter(
        (session) =>
          session.accounts && session.accounts.includes(this.active.address)
      );
      const sites = findbyAddress.map((elem) => elem.host);
      if (this.domain && sites.includes(this.domain)) return true;
      return false;
    },
  },
  async mounted() {
    this.domain = await this.getCurrentTabUrl();
  },
  methods: {
    showSwitchAccounts() {
      this.$modal.show("modal-switch-account");
    },
  },
};
</script>
<style lang="scss">
.wifi-icon {
  width: 13px;
  height: 13px;
}
.connected-sites-container {
  position: absolute;
  left: 0;
  top: 10px;
  color: #ff0022;
  display: flex;
  align-items: center;
  font-size: 11px;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  i {
    font-size: 15px;
  }
  &.connected {
    color: #2bb743;
  }
  &:hover {
    box-shadow: 0px 0px 8px #00000033;
  }
  &:active,
  &:focus {
    box-shadow: inset 0px 0px 8px #00000033;
  }
}
</style>
