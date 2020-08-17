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

import * as storage from "../services/StorageService";
import AppInfo from "../app.json";

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

///
//change the state

const HRCTokens = store.state.hrc20.tokens;
const isPreviousVersion = !Array.isArray(HRCTokens[Object.keys(HRCTokens)[0]]);
if (isPreviousVersion) {
  const netWorkKeys = Object.keys(HRCTokens);
  let newTokenArray = {
    Mainnet: [],
    Testnet: [],
  };
  netWorkKeys.forEach((network) => {
    const tokenArray = Object.keys(HRCTokens[network]);
    tokenArray.forEach((token) => {
      if (network === "1") {
        newTokenArray["Mainnet"].push({
          symbol: token,
          address: HRCTokens[network][token].address,
          decimals: HRCTokens[network][token].decimals,
          balance: 0,
        });
      } else {
        newTokenArray["Testnet"].push({
          symbol: token,
          address: HRCTokens[network][token].address,
          decimals: HRCTokens[network][token].decimals,
          balance: 0,
        });
      }
    });
  });

  store.commit("hrc20/setTokenArray", {
    network: "Mainnet",
    tokenArray: newTokenArray["Mainnet"],
  });
  store.commit("hrc20/setTokenArray", {
    network: "Testnet",
    tokenArray: newTokenArray["Testnet"],
  });
}
///

//save the version info
storage.getValue("meta").then(({ meta }) => {
  storage.saveValue({
    meta: {
      ...meta,
      version: AppInfo.version,
    },
  });
});

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
