import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import { sync } from "vuex-router-sync";
import VueIntl from "vue-intl";
import vClickOutside from "v-click-outside";
import VueClipboard from "vue-clipboard2";
// import VModal from "vue-js-modal";
import Notifications from "vue-notification";
Vue.config.productionTip = false;

sync(store, router);

Vue.use(Notifications);
Vue.use(VueIntl);
Vue.use(vClickOutside);
Vue.use(VueClipboard);
// Vue.use(VModal, { dialog: true, dynamic: true, injectModalsContainer: true });

Vue.setLocale("en-US");

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount("#app");

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const { type, action, payload } = message;
  if (!type || type !== "FROM_BACK_TO_POPUP") {
    return false;
  }
  if (action === "STATE_CHANGE") {
    if (payload.status === "LOGIN") {
      router.push("/login");
    } else if (payload.status === "SIGN") {
      router.push("/sign");
    } else if (payload.status === "CLOSE") {
      window.close();
    }
  }
  return true;
});
