export default {
  namespaced: true,

  state: {
    auth: {
      isLocked: false,
      pincode: "",
      pindigits: 4,
      timeout: 30 * 60 * 1000, //milisec, default 30min
      attempts: 5,
      countdown: 60, //sec, delay 1min when auth fails
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
      state.auth.attempts = payload;
    },
    setCountdown(state, payload) {
      state.auth.countdown = payload;
    },
    resetFailedTimer(state) {
      state.auth.attempts = 5;
      state.auth.countdown = 60;
    },
  },
};
