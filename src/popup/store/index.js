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
  supportCircular: true,
  storage: window.localStorage,
  modules: ["wallets", "network", "provider", "hrc20", "settings"],
});

export default new Vuex.Store({
  getters,
  modules: {
    wallets,
    network,
    account,
    provider,
    hrc20,
    settings,
  },

  state: {
    loading: false,
  },

  mutations: {
    loading(state, loading) {
      state.loading = loading;
    },
  },

  plugins: [vuexLocal.plugin],
});
