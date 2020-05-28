export default {
  namespaced: true,

  state: {
    active: {
      name: "",
      isLedger: false,
      address: false,
      keystore: false,
    },
    accounts: [],
  },

  mutations: {
    addAccount(state, payload) {
      //payload should look like {name: "Account1", address: "one1xxxx", keystore: Object, isLedger: xxx};
      state.accounts.push(payload);
      state.active = payload;
    },
    setActive(state, payload) {
      //set active account when you select the account in the menu
      const acc = state.accounts.find((acc) => acc.name === payload);
      state.active = acc;
    },
  },
};
