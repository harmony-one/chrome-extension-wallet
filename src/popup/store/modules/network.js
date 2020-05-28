export default {
  namespaced: true,

  state: {
    id: 1,
    chainId: 1,
    name: "Mainnet",
    apiUrl: "https://api.s0.t.hmny.io",
    type: "mainnet",
  },

  mutations: {
    change(state, network) {
      console.log("saving network", network);
      state.id = network.id;
      state.chainId = network.chainId;
      state.name = network.name;
      state.apiUrl = network.apiUrl;
      state.type = network.type;
    },
  },
};
