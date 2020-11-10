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
        <AccountList :host="domain" />
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
  }),
  components: {
    AccountList,
  },
  mixins: [helper],
  computed: {
    connected() {
      if (!this.domain) return false;
      return this.isSessionExist(this.domain);
    },
    accountLength() {
      if (this.connected)
        return this.getSessionByHost(this.domain).accounts.length;
      return 0;
    },
  },
  async mounted() {
    this.domain = await this.getCurrentTabUrl();
  },
  methods: {
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
