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
      <div v-if="sites.length">
        <div class="session-title">
          <span class="session-name">{{
            compressString(active.name, 10, 5)
          }}</span>
          is connected to these sites.
        </div>
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
      <div v-else>
        <span class="session-name">{{
          compressString(active.name, 10, 5)
        }}</span>
        is not connected to any sites.
      </div>
      <div
        v-if="!sessionExist && domain"
        class="manual-add-but"
        @click="manualConnect"
      >
        Manually connect to current site
      </div>
    </div>
    <div class="modal-footer">
      <div class="primary" @click="accept">OK</div>
    </div>
    <ManualConnect @refresh="loadSession" />
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
  data: () => ({
    sites: [],
    domain: "",
    connected: false,
    sessionExist: false,
  }),
  mixins: [helper],
  components: {
    ManualConnect,
  },
  computed: {
    ...mapState({
      active: (state) => state.wallets.active,
    }),
  },
  watch: {
    sessions() {
      console.log("connected modal session changed");
    },
    async active() {
      await this.loadSession();
    },
  },
  async mounted() {
    await this.loadSession();
  },
  methods: {
    manualConnect() {
      this.$modal.show("modal-connect-accounts");
    },
    async loadSession() {
      const { sites, domain, connected } = await this.checkSession(
        this.active.address
      );
      this.sites = sites;
      this.domain = domain;
      this.connected = connected;
      this.sessionExist = this.isSessionExist(domain);
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
              this.$store.dispatch("provider/revokeSession", index);
              //sendEventToContentScript(SESSION_REVOKED, expiredSession);
              this.$notify({
                group: "notify",
                type: "success",
                text: "Session revoked",
              });
              await this.loadSession();
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
