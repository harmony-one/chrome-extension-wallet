import { TOKENS, VALIDTOKENS } from "../../../lib/contracts/config";

export default {
  namespaced: true,
  state: {
    tokens: TOKENS,
    validTokens: VALIDTOKENS,
  },
  mutations: {
    loadTokenBalance(state, payload) {
      state.tokens[payload.symbol] = {
        ...state.tokens[payload.symbol],
        balance: payload.balance,
      };
    },
  },
};
