import tokens from "../../../lib/contracts/config";

export default {
  namespaced: true,
  state: {
    tokens: tokens,
  },
  mutations: {
    loadTokenBalance(state, payload) {
      state.tokens[payload.token] = {
        ...state.tokens[payload.token],
        balance: payload.balance,
      };
    },
  },
};
