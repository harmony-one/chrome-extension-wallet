<template>
  <div class="auth-page"></div>
</template>
<script>
import { mapState } from "vuex";
import * as storage from "../services/StorageService";
export default {
  computed: {
    ...mapState({
      timeout: (state) => state.settings.auth.timeout,
    }),
  },
  mounted() {
    storage.getValue("lastClosed").then((data) => {
      const now = Date.now();
      const lastClosed = data.lastClosed;
      const offset = now - lastClosed;
      if (offset >= this.timeout) {
        this.$store.commit("settings/setLocked", true);
        this.$router.push("/lock");
      } else this.$router.push("/main");
    });
  },
};
</script>
<style>
.auth-page {
  width: 370px;
  height: 600px;
}
</style>
