import _ from "lodash";

export default {
  namespaced: true,
  state: {
    tokens: {
      Mainnet: [],
      Testnet: [],
      Localnet: [],
    },
    initialized: false,
  },
  actions: {
    deleteToken({ commit, state }, payload) {
      const tokenArray = state.tokens[payload.network];
      _.remove(tokenArray, { address: payload.token.address });
      commit("setTokenArray", {
        network: payload.network,
        tokenArray,
      });
    },
    editToken({ commit, state }, payload) {
      const tokenArray = state.tokens[payload.network];
      const index = _.findIndex(tokenArray, {
        address: payload.token.address,
      });
      if (index < 0) return;
      tokenArray[index].name = payload.token.name;
      commit("setTokenArray", {
        network: payload.network,
        tokenArray,
      });
    },
  },
  mutations: {
    setTokenArray(state, payload) {
      state.tokens[payload.network] = [...payload.tokenArray];
    },
    setInitalized(state, payload) {
      state.initialized = payload;
    },
    addToken(state, payload) {
      const { address, name, network } = payload;
      state.tokens[network].push({
        name,
        address,
      });
    },
  },
};
