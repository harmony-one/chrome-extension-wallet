<template>
  <section>
    <div
      class="connected-sites-container"
      :class="{ connected: connected }"
      @click="showConnectedSite"
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
    <ConnectedModal @refresh="loadSession" />
  </section>
</template>

<script>
import apiService from "services/APIService";
import ConnectedModal from "./ConnectedModal";
import _ from "lodash";
import { mapState } from "vuex";
import helper from "mixins/helper";
export default {
  data: () => ({
    connected: false,
    domain: "",
  }),
  mixins: [helper],
  components: {
    ConnectedModal,
  },
  computed: {
    ...mapState({
      active: (state) => state.wallets.active,
    }),
  },
  async mounted() {
    await this.loadSession();
  },
  methods: {
    async loadSession() {
      const res = await this.checkSession(this.active.address);
      this.connected = res.connected;
    },
    showConnectedSite() {
      this.$modal.show("modal-connected-sites");
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
    color: #4cd964;
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
