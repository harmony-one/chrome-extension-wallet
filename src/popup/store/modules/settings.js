import { encryptString } from "services/CryptoService";
import { v4 as uuidv4 } from "uuid";

export default {
  namespaced: true,

  state: {
    auth: {
      lockState: null,
      password: null,
      timeout: 30 * 60 * 1000, //milisec, default 30min
      attempts: 5,
      countdown: 60, //sec, delay 1min when auth fails
    },
    dontShowContactsModal: false,
    dontShowSwitchModal: false,
    hideLowBalance: false,
    contacts: [],
  },
  mutations: {
    setHideLowBalance(state, payload) {
      state.hideLowBalance = payload;
    },
    setDontShowSwitchModal(state, payload) {
      state.dontShowSwitchModal = payload;
    },
    setDontShowContactsModal(state, payload) {
      state.dontShowContactsModal = payload;
    },
    setPassword(state, payload) {
      state.auth.password = { ...payload };
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
    setPassword({ commit }, payload) {
      try {
        const salt = uuidv4().replace(/-/g, "");
        const data = {
          payload: encryptString(payload, salt),
          salt,
        };
        commit("setPassword", data);
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
