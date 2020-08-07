<template>
  <div class="auth-page"></div>
</template>
<script>
import { mapState } from "vuex";
import * as storage from "../services/StorageService";
export default {
  computed: {
    ...mapState({
      accounts: state => state.wallets.accounts,
      pincode: state => state.settings.auth.pincode,
      timeout: state => state.settings.auth.timeout
    })
  },
  mounted() {
    storage.getValue("lastClosed").then(({ lastClosed }) => {
      if (lastClosed && this.accounts.length && this.pincode) {
        const now = Date.now();
        const offset = now - lastClosed;
        if (offset >= this.timeout) {
          this.$store.commit("settings/setLocked", true);
          this.$router.push("/lock");
          return;
        }
      }
      storage.saveValue({ lastOpened: Date.now() });
      this.$router.push("/home");
    });
  }
};
</script>
<style>
.auth-page {
  width: 370px;
  height: 600px;
  padding: 1rem;
  background-image: linear-gradient(
      rgba(247, 247, 255, 0.95),
      rgba(247, 247, 255, 0.95)
    ),
    url("images/harmony.png");
}
</style>
