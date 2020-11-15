import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import wallets from "./modules/wallets";
import network from "./modules/network";
import hrc20 from "./modules/hrc20";
import account from "./modules/account";
import provider from "./modules/provider";
import settings from "./modules/settings";
import * as getters from "./getters";

Vue.use(Vuex);

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  supportCircular: true,

  modules: ["wallets", "network", "hrc20", "provider", "settings"],
});

export default new Vuex.Store({
  getters,
  modules: {
    wallets,
    provider,
    network,
    account,
    hrc20,
    settings,
  },

  state: {
    loading: false,
    currentTab: "",
  },

  mutations: {
    loading(state, loading) {
      state.loading = loading;
    },
    currentTab(state, payload) {
      state.currentTab = payload;
    },
  },

  plugins: [vuexLocal.plugin],
});
