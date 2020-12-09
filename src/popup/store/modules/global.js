export default {
  namespaced: true,

  state: {
    showCheckBox: false,
  },

  mutations: {
    showCheckBox(state, payload) {
      state.showCheckBox = payload;
    },
  },
};
