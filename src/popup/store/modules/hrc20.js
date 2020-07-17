import { HRCTokens } from "../../../lib/contracts/config";

export default {
  namespaced: true,
  state: {
    tokens: HRCTokens,
  },
  mutations: {
    loadTokenBalance(state, payload) {
      state.tokens[payload.network][payload.symbol] = {
        ...state.tokens[payload.network][payload.symbol],
        balance: payload.balance,
      };
    },
  },
};
