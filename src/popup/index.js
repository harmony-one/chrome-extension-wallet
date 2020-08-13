import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import { sync } from "vuex-router-sync";
import VueIntl from "vue-intl";
import vClickOutside from "v-click-outside";
import VueClipboard from "vue-clipboard2";
import VModal from "vue-js-modal";
import Notifications from "vue-notification";
import AppHeader from "./components/AppHeader.vue";
import SeedChecker from "./components/SeedChecker";
import RadioButton from "./components/RadioButton";
import PincodeInput from "vue-pincode-input";
import PincodeModal from "./pages/Settings/Security/PincodeModal.vue";
import MoonLoader from "vue-spinner/src/MoonLoader";

import Config from "../config";

import { CLOSE_WINDOW, FROM_BACK_TO_POPUP } from "../types";

import "./css/icons.less";
import "./css/normalize.scss";
import "./css/style.scss";

Vue.config.productionTip = false;

sync(store, router);

Vue.component("MoonLoader", MoonLoader);
Vue.component("AppHeader", AppHeader);
Vue.component("SeedChecker", SeedChecker);
Vue.component("PincodeInput", PincodeInput);
Vue.component("RadioButton", RadioButton);
Vue.component("PincodeModal", PincodeModal);
Vue.use(Notifications);
Vue.use(VueIntl);
Vue.use(vClickOutside);
Vue.use(VueClipboard);
Vue.use(VModal, { dialog: true, dynamic: true, injectModalsContainer: true });

Vue.setLocale("en-US");

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount("#app");

//init the store
if (!store.state.network.name)
  store.commit("network/change", Config.networks[0]);
if (!store.state.settings.auth.lockState)
  store.dispatch("settings/setLockState", false);

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const { type, action, payload } = message;
  if (!type || type !== FROM_BACK_TO_POPUP) {
    return false;
  }
  if (action === CLOSE_WINDOW) {
    window.close();
  }
  sendResponse();
  return true;
});
