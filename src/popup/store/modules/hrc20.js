import { HRCTokens } from "../../../services/hrc20/config";

export default {
  namespaced: true,
  state: {
    tokens: HRCTokens,
  },
  mutations: {
    loadTokenBalance(state, payload) {
      const token = state.tokens[payload.network][payload.symbol];
      if (!token) return;
      state.tokens[payload.network][payload.symbol] = {
        ...token,
        balance: payload.balance,
      };
    },
    addToken(state, payload) {
      const { address, symbol, network, decimals } = payload;
      state.tokens[network][symbol] = {
        address,
        decimals,
      };
    },
  },
};
