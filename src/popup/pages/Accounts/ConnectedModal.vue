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
      <div class="session-title">
        <span class="session-name">{{
          compressAddress(active.name, 10, 5)
        }}</span>
        is connected to these sites.
      </div>
      <div v-if="sites.length" class="site-list">
        <div
          class="site-item"
          v-for="(site, index) in sites"
          :key="index"
          :class="{ active: site === domain }"
        >
          <span>{{ site }}</span>
          <div class="delete-but" @click="revoke(site, index)">
            <i class="material-icons">delete</i>
          </div>
        </div>
      </div>
      <div v-else>
        {{ compressAddress(active.name, 10, 5) }} is not connected to any sites.
      </div>
      <div class="manual-add-but">
        Manually connect to current site
      </div>
    </div>
    <div class="modal-footer">
      <div class="primary" @click="accept">OK</div>
    </div>
  </modal>
</template>

<script>
import { mapState } from "vuex";
import apiService from "services/APIService";
import * as storage from "services/StorageService";
import { sendEventToContentScript } from "services/APIService";
import helper from "mixins/helper";
import { SESSION_REVOKED } from "~/types.js";
export default {
  data: () => ({
    sites: [],
    domain: "",
  }),
  mixins: [helper],
  computed: {
    ...mapState({
      active: (state) => state.wallets.active,
    }),
  },
  watch: {
    async active() {
      await this.loadSession();
    },
  },
  async mounted() {
    await this.loadSession();
  },
  methods: {
    async loadSession() {
      const { sites, domain } = await this.checkSession(this.active.address);
      this.sites = sites;
      this.domain = domain;
    },
    revoke(site, index) {
      const text =
        (site === this.domain
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

              let sessionList = await apiService.getHostSessions();
              const existIndex = sessionList.findIndex(
                (elem) =>
                  elem.host === site &&
                  elem.account.address === this.active.address
              );
              if (existIndex >= 0) {
                const expiredSession = sessionList[existIndex];
                sessionList.splice(existIndex, 1);
                await storage.saveValue({
                  session: sessionList,
                });
                this.$notify({
                  group: "notify",
                  type: "success",
                  text: "Session revoked",
                });
                await this.loadSession();
                sendEventToContentScript(SESSION_REVOKED, expiredSession);
              } else {
                this.$notify({
                  group: "notify",
                  type: "error",
                  text: "Session is not found",
                });
              }
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
.delete-but {
  cursor: pointer;
  align-items: center;
  display: flex;
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
