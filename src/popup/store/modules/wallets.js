import _ from "lodash";
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
      if (payload.isLedger) {
        //check for existing ledger account
        const acc = _.find(state.accounts, { isLedger: true });

        //replace the existing account
        if (acc !== undefined) {
          acc.name = payload.name;
          acc.address = payload.address;
          state.active = acc;
          return;
        }
      }

      //else if there's no ledger or not a ledger account, then insert a new account
      state.accounts.push(payload);
      state.active = payload;
    },

    setActive(state, payload) {
      //set active account when you select the account in the menu
      const acc = _.find(state.accounts, { address: payload });
      state.active = acc;
    },
  },
};
