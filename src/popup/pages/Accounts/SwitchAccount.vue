<template>
  <modal
    name="modal-switch-account"
    :adaptive="true"
    transition="scale"
    :width="340"
    height="auto"
  >
    <div class="modal-header">{{ domain }}</div>
    <div class="modal-body">
      <div v-if="!connected">
        Onewallet is not connected to this site. To use onewallet provider, find
        the connect button on their website.
      </div>
      <div v-else>
        <div class="count-caption">
          {{ `You have ${accountLength} accounts connected to this site.` }}
        </div>
        <AccountList :host="domain" @refresh="loadSession" />
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
    accountLength: 0,
  }),
  components: {
    AccountList,
  },
  mixins: [helper],
  async mounted() {
    await this.loadSession();
  },
  methods: {
    async loadSession() {
      this.domain = await this.getCurrentTabUrl();
      this.connected = this.isSessionExist(this.domain);
      if (this.connected)
        this.accountLength = this.getSessionByHost(this.domain).accounts.length;
    },
    accept() {
      this.$modal.hide("modal-switch-account");
    },
  },
};
</script>
<style lang="scss" scoped>
.count-caption {
  margin-bottom: 10px;
}
</style>
