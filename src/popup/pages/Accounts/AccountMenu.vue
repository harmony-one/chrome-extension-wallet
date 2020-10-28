<template>
  <section>
    <div
      class="account-menu-container"
      @click="showMenu"
      v-click-outside="hideMenu"
    >
      <div class="account-menu-but">
        <i class="material-icons">more_vert</i>
      </div>
      <div class="account-menu" v-show="menuOpen">
        <div class="account-menu-item" @click="expandView">
          <i class="material-icons">zoom_out_map</i>
          <span>Expand View</span>
        </div>
        <div class="account-menu-item" @click="viewOnExplorer">
          <i class="material-icons">open_in_new</i>
          <span>View on Explorer</span>
        </div>
        <div class="account-menu-item" @click="connectedSites">
          <i class="material-icons">rss_feed</i>
          <span>Connected Sites</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import _ from "lodash";
import { mapState } from "vuex";
const { ChainID } = require("@harmony-js/utils");
export default {
  data: () => ({
    menuOpen: false,
  }),
  computed: {
    ...mapState({
      network: (state) => state.network,
      active: (state) => state.wallets.active,
    }),
  },
  methods: {
    expandView() {
      chrome.tabs.create({
        url: "popup.html#home",
      });
    },
    viewOnExplorer() {
      if (this.network.chainId === ChainID.HmyMainnet)
        chrome.tabs.create({
          url: `https://explorer.harmony.one/#/address/${this.active.address}`,
        });
      else if (this.network.chainId === ChainID.HmyTestnet)
        chrome.tabs.create({
          url: `https://explorer.pops.one/#/address/${this.active.address}`,
        });
    },
    connectedSites() {},
    showMenu() {
      this.menuOpen = !this.menuOpen;
    },
    hideMenu() {
      this.menuOpen = false;
    },
  },
};
</script>
<style lang="scss">
.account-menu-container {
  position: absolute;
  right: 1rem;
  top: 24px;
}
.account-menu-but {
  cursor: pointer;
  i {
    font-weight: 600;
  }
}
.account-menu {
  position: absolute;
  right: 10px;
  width: 150px;
  top: 24px;
  z-index: 100;
  background: white;
  box-shadow: 0 4px 7px rgba(0, 0, 0, 0.4);
  border-radius: 5px;
  .account-menu-item {
    padding: 0.7rem 0.5rem;
    display: flex;
    font-size: 13px;
    gap: 5px;
    text-align: left;
    align-items: center;
    &:hover {
      background: #eee;
    }
  }
  &:hover {
    cursor: pointer;
  }
}
</style>
