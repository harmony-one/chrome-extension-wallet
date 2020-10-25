<template>
  <modal
    name="modal-connected-sites"
    :adaptive="true"
    transition="scale"
    :width="300"
    height="auto"
  >
    <div class="modal-header">{{ domain }}</div>
    <div class="modal-body">
      <div v-if="!connected">Account is not connected to this site.</div>
      <div v-else>
        Account is connected to this site.
      </div>
      <div v-if="sites.length" class="site-container">
        <div class="session-title">All sessions</div>
        <div class="site-list">
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
    connected: false,
    sites: [],
    domain: "",
  }),
  mixins: [helper],
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
      const { sites, domain, connected } = await this.checkSession(
        this.active.address
      );
      this.sites = sites;
      this.domain = domain;
      this.connected = connected;
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
                this.$emit("refresh");
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
.session-title {
  padding: 5px 5px 5px 0;
  font-weight: 700;
  border-bottom: 1px solid #eee;
  margin-bottom: 5px;
}
.site-container {
  margin-bottom: 5px;
}
.delete-but {
  cursor: pointer;
  align-items: center;
  display: flex;
}
.site-list {
  max-height: 250px;
  overflow: auto;
}
</style>
