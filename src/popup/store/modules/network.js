export default {
  namespaced: true,

  state: {
    id: 0,
    chainId: 0,
    name: "",
    apiUrl: "",
    type: "",
    tokens: [],
  },

  mutations: {
    change(state, network) {
      state.id = network.id;
      state.chainId = network.chainId;
      state.name = network.name;
      state.apiUrl = network.apiUrl;
      state.type = network.type;
      state.tokens = network.tokens;
    },
  },
};
