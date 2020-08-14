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
      commit("setTokenArray", {
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
      commit("setTokenArray", {
        network: payload.network,
        tokenArray,
      });
    },
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
      tokenArray[index].symbol = payload.token.symbol;
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
    addToken(state, payload) {
      const { address, symbol, network, decimals } = payload;
      state.tokens[network].push({
        symbol,
        address,
        decimals,
        balance: 0,
      });
    },
  },
};
