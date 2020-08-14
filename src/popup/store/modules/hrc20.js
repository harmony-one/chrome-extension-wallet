import HRCTokens from "../../../services/hrc20/config";
import _ from "lodash";

export default {
  namespaced: true,
  state: {
    tokens: HRCTokens,
  },
  actions: {
    setTokenBalanceLoading({ commit, state }, payload) {
      const tokenArray = state.tokens[payload.network];
      const index = _.findIndex(tokenArray, {
        address: payload.token.address,
      });
      if (index < 0) return;
      tokenArray[index] = {
        ...tokenArray[index],
        isLoading: payload.loading,
      };
      commit("setTokenBalanceLoading", {
        network: payload.network,
        tokenArray,
      });
    },
    loadTokenBalance({ commit, state }, payload) {
      const tokenArray = state.tokens[payload.network];
      const index = _.findIndex(tokenArray, {
        address: payload.token.address,
      });
      if (index < 0) return;
      tokenArray[index] = {
        ...tokenArray[index],
        balance: payload.balance,
        isLoading: false,
      };
      commit("loadTokenBalance", {
        network: payload.network,
        tokenArray,
      });
    },
    deleteToken({ commit, state }, payload) {
      const tokenArray = state.tokens[payload.network];
      _.remove(tokenArray, { address: payload.token.address });
      commit("deleteToken", {
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
      tokenArray[index].symbol = payload.token.symbol;
      commit("editToken", {
        network: payload.network,
        tokenArray,
      });
    },
  },
  mutations: {
    setTokenBalanceLoading(state, payload) {
      state.tokens[payload.network] = [...payload.tokenArray];
    },
    loadTokenBalance(state, payload) {
      state.tokens[payload.network] = [...payload.tokenArray];
    },
    addToken(state, payload) {
      const { address, symbol, network, decimals } = payload;
      state.tokens[network].push({
        symbol,
        address,
        decimals,
        balance: 0,
      });
    },
    deleteToken(state, payload) {
      state.tokens[payload.network] = [...payload.tokenArray];
    },
    editToken(state, payload) {
      state.tokens[payload.network] = [...payload.tokenArray];
    },
  },
};
