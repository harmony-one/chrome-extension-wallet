<template>
  <modal
    name="modal-switch-account"
    :adaptive="true"
    transition="scale"
    :width="340"
    @before-close="onBeforeClose"
    height="auto"
  >
    <div class="modal-header">{{ currentTab }}</div>
    <div class="modal-body">
      <div v-if="!connected">
        Onewallet is not connected to this site. To use onewallet provider, find
        the connect button on their website.
      </div>
      <div v-else>
        <div class="count-caption">
          {{ `You have ${accountLength} accounts connected to this site.` }}
        </div>
        <AccountList :host="currentTab" />
      </div>
      <div class="dontshow-container" v-if="showCheckBox">
        <input type="checkbox" id="dontshow" v-model="dontshow" />
        <label for="dontshow">Don't show this again</label>
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
export default {
  data: () => ({
    dontshow: false,
  }),
  components: {
    AccountList,
  },
  mixins: [helper],
  computed: {
    ...mapState({
      showCheckBox: (state) => state.global.showCheckBox,
    }),
    connected() {
      if (!this.currentTab) return false;
      return this.isSessionExist(this.currentTab);
    },
    accountLength() {
      if (this.connected)
        return this.getSessionByHost(this.currentTab).accounts.length;
      return 0;
    },
  },
  methods: {
    onBeforeClose(e) {
      this.$store.commit("global/showCheckBox", false);
    },
    accept() {
      this.$modal.hide("modal-switch-account");
      this.$store.commit("settings/setDontShowSwitchModal", this.dontshow);
    },
  },
};
</script>
<style lang="scss" scoped>
.count-caption {
  margin-bottom: 10px;
}
</style>
