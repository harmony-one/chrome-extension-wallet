<template>
  <modal
    name="modal-connected-sites"
    :adaptive="true"
    transition="scale"
    :width="300"
    height="auto"
  >
    <div class="modal-header">Connected Sites</div>
    <div class="modal-body">
      <div v-if="connectedSites.length">
        <div class="session-title">
          <span class="session-name">{{
            compressString(active.name, 10, 5)
          }}</span>
          is connected to these sites.
        </div>
        <div class="site-list">
          <div
            class="site-item"
            v-for="(site, index) in connectedSites"
            :key="index"
            :class="{ active: site === currentTab }"
          >
            <span>{{ site }}</span>
            <div class="delete-but" @click="disconnect(site, active.address)">
              <i class="material-icons">delete</i>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <span class="session-name">{{
          compressString(active.name, 10, 5)
        }}</span>
        is not connected to any sites.
      </div>
      <div
        v-if="!isSessionExist(currentTab) && currentTab"
        class="manual-add-but"
        @click="manualConnect"
      >
        Manually connect to current site
      </div>
    </div>
    <div class="modal-footer">
      <div class="primary" @click="accept">OK</div>
    </div>
    <ManualConnect />
  </modal>
</template>

<script>
import { mapState } from "vuex";
import apiService from "services/APIService";
import { sendEventToContentScript } from "services/APIService";
import { SESSION_REVOKED } from "~/types";
import ManualConnect from "./ManualConnect";
import helper from "mixins/helper";
export default {
  mixins: [helper],
  components: {
    ManualConnect,
  },
  computed: {
    ...mapState({
      active: (state) => state.wallets.active,
    }),
    connected() {
      if (!this.currentTab) return false;
      const findbyAddress = this.sessions.filter(
        (session) =>
          session.accounts && session.accounts.includes(this.active.address)
      );
      const sites = findbyAddress.map((elem) => elem.host);
      if (this.currentTab && sites.includes(this.currentTab)) return true;
      return false;
    },
    connectedSites() {
      if (!this.currentTab) return false;
      const findbyAddress = this.sessions.filter(
        (session) =>
          session.accounts && session.accounts.includes(this.active.address)
      );
      return findbyAddress.map((elem) => elem.host);
    },
  },
  methods: {
    manualConnect() {
      this.$modal.show("modal-connect-accounts");
    },

    disconnect(site, address) {
      const text =
        (site === this.currentTab
          ? "This session is currently <b>active</b>.<br>"
          : "") + "Are you sure you want to revoke this session?";
      this.$modal.show("dialog", {
        text: text,
        buttons: [
          {
            title: "Cancel",
            default: true,
            handler: () => {
              this.$modal.hide("dialog");
            },
          },
          {
            title: "Revoke",
            handler: async () => {
              this.$modal.hide("dialog");
              const index = this.getSessionIndexByHost(site);
              this.$store.dispatch("provider/disconnectAccount", {
                host: site,
                index: this.sessions[index].accounts.findIndex(
                  (add) => add === this.active.address
                ),
              });
              this.$notify({
                group: "notify",
                type: "success",
                text: "Session revoked",
              });
            },
          },
        ],
      });
    },
    accept() {
      this.$modal.hide("modal-connected-sites");
    },
  },
};
</script>
<style lang="scss" scoped>
.site-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 5px;
  padding-left: 0px;
  border: none;
  word-break: break-all;
  align-items: center;
  &.active {
    span {
      color: #2bb743;
    }
  }
}
.site-list {
  max-height: 250px;
  overflow: auto;
  margin-bottom: 5px;
  padding: 5px 0px;
  border-bottom: 1px solid #ddd;
  border-top: 1px solid #ddd;
}
.session-title {
  padding-bottom: 10px;
}
.session-name {
  color: #0987d7;
}
.manual-add-but {
  padding: 5px 10px;
  color: #0a93eb;
  text-align: center;
  border: none;
  cursor: pointer;
  &:hover {
    color: #0987d7;
  }
  &:focus,
  &:active {
    color: #1f6bb7;
  }
}
</style>
