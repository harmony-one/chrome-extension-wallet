<template>
  <modal
    name="modal-switch-account"
    :adaptive="true"
    transition="scale"
    :width="300"
    height="auto"
  >
    <div class="modal-header">{{ domain }}</div>
    <div class="modal-body">
      <div v-if="!connected">
        Onewallet is not connected to this site. To use onewallet provider, find
        the connect button on their website.
      </div>
      <div v-else>
        <AccountList :accounts="accounts" />
      </div>
    </div>
    <div class="modal-footer">
      <div class="primary" @click="accept">OK</div>
    </div>
  </modal>
</template>

<script>
import apiService from "services/APIService";
import { mapState } from "vuex";
import AccountList from "./AccountList";
import helper from "mixins/helper";
import _ from "lodash";
export default {
  data: () => ({
    domain: "",
    connected: false,
    accounts: [],
  }),
  components: {
    AccountList,
  },
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
      this.domain = await this.getCurrentTabUrl();
      const sessions = await apiService.getHostSessions();
      const findByHost = _.find(sessions, { host: this.domain });
      if (!findByHost || !findByHost.accounts || !findByHost.accounts.length)
        this.connected = false;
      else {
        this.connected = true;
        this.accounts = findByHost.accounts;
      }
    },
    accept() {
      this.$modal.hide("modal-switch-account");
    },
  },
};
</script>
<style lang="scss" scoped></style>
