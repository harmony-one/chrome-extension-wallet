<template>
  <modal
    name="modal-connect-accounts"
    :adaptive="true"
    transition="scale"
    :width="300"
    height="auto"
  >
    <div class="modal-header">{{ currentTab }}</div>
    <div class="modal-body">
      <div v-for="(account, index) in accounts" :key="index">
        <input type="checkbox" :id="index" v-model="checked[index]" />
        <label :for="index"
          >{{ compressString(account.name, 5, 5) }}
          <span class="address-indicator">
            {{ "(" + compressString(account.address, 7, 5) + ")" }}</span
          >
        </label>
      </div>
    </div>
    <div class="modal-footer">
      <div class="secondary" @click="deny">CLOSE</div>
      <div class="primary" @click="accept">CONNECT</div>
    </div>
  </modal>
</template>

<script>
import { mapState } from "vuex";
import apiService from "services/APIService";
import helper from "mixins/helper";
export default {
  data: () => ({
    checked: [],
  }),
  mixins: [helper],
  computed: {
    ...mapState({
      accounts: (state) => state.wallets.accounts,
      active: (state) => state.wallets.active,
    }),
  },
  created() {
    this.checked = new Array(this.accounts.length).fill(false);
  },
  methods: {
    deny() {
      this.$modal.hide("modal-connect-accounts");
    },
    async accept() {
      this.$modal.hide("modal-connect-accounts");
      let accounts = [];
      this.accounts.forEach((acc, index) => {
        if (this.checked[index]) accounts.push(acc.address);
      });
      this.$store.dispatch("provider/setAccounts", {
        host: this.currentTab,
        accounts,
        active: this.active.address,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.address-indicator {
  font-style: italic;
  color: #1f6bb7;
}
</style>
