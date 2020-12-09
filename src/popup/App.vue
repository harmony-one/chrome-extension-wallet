<template>
  <div id="app">
    <loading
      :active.sync="isLoading"
      color="#0a93eb"
      :opacity="0.88"
      :height="75"
      :width="55"
      :z-index="500"
    ></loading>
    <v-dialog transition="scale" class="v__dialog" :width="250" />
    <transition :name="transitionName" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
import { APP_CONNECT } from "~/types";
export default {
  data: () => ({
    transitionName: "none",
  }),
  components: {
    Loading,
  },
  computed: mapState({
    isLoading: (state) => state.loading,
  }),
  methods: {
    async getCurrentTabUrl() {
      const tabs = await window.browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const activeTab = tabs[0];
      if (activeTab && activeTab.url) {
        return new URL(activeTab.url).host;
      }
      return false;
    },
  },
  async created() {
    const currentTab = await this.getCurrentTabUrl();
    this.$store.commit("currentTab", currentTab);
  },
  async mounted() {
    this.$router.beforeEach((to, from, next) => {
      if ((from.name !== "auth" && to.name === "lock") || from.name === "lock")
        this.transitionName = "fade";
      else this.transitionName = "none";
      next();
    });
    chrome.runtime.connect({ name: APP_CONNECT });
  },
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
