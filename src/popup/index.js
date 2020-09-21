import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import { sync } from "vuex-router-sync";
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
import ScaleLoader from "vue-spinner/src/ScaleLoader";
import ClipLoader from "vue-spinner/src/ClipLoader";
import Tooltip from "vue-directive-tooltip";
import vSelect from "vue-select";
import "vue-select/src/scss/vue-select.scss";
import "vue-directive-tooltip/dist/vueDirectiveTooltip.css";

import BigNumber from "bignumber.js";
import Config from "~/config";

import * as storage from "services/StorageService";
import AppInfo from "~/app.json";

import { CLOSE_WINDOW, FROM_BACK_TO_POPUP } from "~/types";

import "./css/icons.less";
import "./css/normalize.scss";
import "./css/style.scss";
import "./css/modal.scss";
import "./css/vue-select.scss";

Vue.config.productionTip = false;

sync(store, router);

Vue.component("v-select", vSelect);
Vue.component("MoonLoader", MoonLoader);
Vue.component("ClipLoader", ClipLoader);
Vue.component("ScaleLoader", ScaleLoader);
Vue.component("AppHeader", AppHeader);
Vue.component("SeedChecker", SeedChecker);
Vue.component("PincodeInput", PincodeInput);
Vue.component("RadioButton", RadioButton);
Vue.component("PincodeModal", PincodeModal);
Vue.use(Notifications);
Vue.use(vClickOutside);
Vue.use(VueClipboard);
Vue.use(Tooltip, {
  delay: 1,
});
Vue.use(VModal, {
  dialog: true,
  dynamic: true,
  injectModalsContainer: true,
});

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

BigNumber.config({
  EXPONENTIAL_AT: [-50, 50],
  FORMAT: {
    prefix: "",
    decimalSeparator: ".",
    groupSeparator: ",",
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: " ",
    fractionGroupSize: 0,
    suffix: "",
  },
});
//change the state

const HRCTokens = store.state.hrc20.tokens;
const isPreviousVersion = HRCTokens["1"] && !Array.isArray(HRCTokens["1"]);
if (isPreviousVersion) {
  const networkKeys = ["1", "2"];
  let newTokenArray = {
    Mainnet: [],
    Testnet: [],
  };
  networkKeys.forEach((network) => {
    const tokenArray = Object.keys(HRCTokens[network]);
    tokenArray.forEach((token) => {
      if (network === "1") {
        newTokenArray["Mainnet"].push({
          symbol: token,
          address: HRCTokens[network][token].address,
          decimals: HRCTokens[network][token].decimals,
          balance: 0,
        });
      } else if (network === "2") {
        newTokenArray["Testnet"].push({
          symbol: token,
          address: HRCTokens[network][token].address,
          decimals: HRCTokens[network][token].decimals,
          balance: 0,
        });
      }
    });
  });

  store.commit("hrc20/resetTokens");

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
  const { type, action } = message;
  if (!type || type !== FROM_BACK_TO_POPUP) {
    return false;
  }
  if (action === CLOSE_WINDOW) {
    window.close();
  }
  sendResponse();
  return true;
});
