<template>
  <div class="auth-page"></div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
import * as storage from "~/services/StorageService";
export default {
  computed: {
    ...mapGetters(["getPassword"]),
    ...mapState({
      accounts: (state) => state.wallets.accounts,
      timeout: (state) => state.settings.auth.timeout,
    }),
  },
  async created() {
    const { AppState } = await storage.getValue("AppState");
    if (AppState) {
      const { lastClosed } = AppState;
      if (lastClosed && this.accounts.length && this.getPassword) {
        const now = Date.now();
        const offset = now - lastClosed;
        if (offset >= this.timeout) {
          this.$store.dispatch("settings/setLockState", true);
          this.$router.push("/lock");
          return;
        }
      }
    }
    storage.saveValue({ AppState: { ...AppState, lastOpened: Date.now() } });
    this.$router.push("/home");
  },
};
</script>
<style>
.auth-page {
  width: 370px;
  height: 600px;
}
</style>
