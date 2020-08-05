export default {
  namespaced: true,

  state: {
    auth: {
      isLocked: false,
      pincode: "1234",
      pindigits: 4,
      timeout: 30 * 60 * 1000, //default 30min
      attempts: 5,
      delayTime: 1 * 60 * 1000, //delay 1min when auth fails
    },
  },

  mutations: {
    setPincode(state, payload) {
      state.auth.pincode = payload;
    },
    setPindigits(state, payload) {
      state.auth.pindigits = payload;
    },
    setLocked(state, payload) {
      state.auth.isLocked = payload;
    },
    setTimeout(state, payload) {
      state.auth.timeout = payload;
    },
    setAttempts(state, payload) {
      const attempt = payload < 0 ? 0 : payload;
      state.auth.attempts = attempt;
    },
    setDelayTime(state, payload) {
      state.auth.delayTime = payload;
    },
  },
};
