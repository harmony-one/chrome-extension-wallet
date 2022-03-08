import { encryptString } from "services/CryptoService";
import { v4 as uuidv4 } from "uuid";

export default {
  namespaced: true,

  state: {
    auth: {
      lockState: null,
      pincode: {
        data: null,
        digits: 4,
      },
      pindigits: 4,
      timeout: 30 * 60 * 1000, //milisec, default 30min
      attempts: 5,
      countdown: 60, //sec, delay 1min when auth fails
    },
    termsAccepted: false,
    hideLowBalance: false,
    displayMode: 0,
    contacts: [],
  },
  mutations: {
    setTermsAccepted(state, payload) {
      state.termsAccepted = payload;
    },
    setHideLowBalance(state, payload) {
      state.hideLowBalance = payload;
    },
    setPincode(state, payload) {
      state.auth.pincode = { ...payload };
    },
    setPindigits(state, payload) {
      state.auth.pindigits = payload;
    },
    setDisplayMode(state, payload) {
      state.displayMode = payload;
    },
    setLockState(state, payload) {
      state.auth.lockState = { ...payload };
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
    setContacts(state, payload) {
      state.contacts = [...payload];
    },
  },
  actions: {
    addContact({ commit, state }, payload) {
      const contactsArray = state.contacts;
      const { name, address } = payload;
      contactsArray.push({ name, address });
      commit("setContacts", contactsArray);
    },
    editContact({ commit, state }, payload) {
      const contactsArray = state.contacts;
      const { index, name, address } = payload;
      if (index < 0) return;
      contactsArray[index] = { name, address };
      commit("setContacts", contactsArray);
    },
    deleteContact({ commit, state }, payload) {
      const contactsArray = state.contacts;
      const index = payload;
      if (index < 0) return;
      contactsArray.splice(payload, 1);
      commit("setContacts", contactsArray);
    },
    setPincode({ commit }, payload) {
      try {
        const salt = uuidv4().replace(/-/g, "");
        const data = {
          payload: encryptString(payload, salt),
          salt,
        };
        commit("setPincode", {
          data,
          digits: payload.length,
        });
      } catch (err) {
        console.error(err);
      }
    },
    setLockState({ commit }, payload) {
      try {
        const salt = uuidv4().replace(/-/g, "");
        const data = {
          payload: encryptString(payload.toString(), salt),
          salt,
        };
        commit("setLockState", data);
      } catch (err) {
        console.error(err);
      }
    },
  },
};
