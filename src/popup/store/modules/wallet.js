export default {
  namespaced: true,

  state: {
    activeWallet: {
      address: false,
      keypass: false,
      keystore: false,
      name: "",
    },
    wallets: [],
  },

  mutations: {
    address(state, address) {
      state.address = address;
    },

    keypass(state, keypass) {
      state.keypass = keypass;
    },

    keystore(state, keystore) {
      state.keystore = keystore;
    },
  },
};
