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
    contacts: [
      {
        name: "Derek",
        address: "one1dpqtyseafx7uspdpf66mgtr3zvhxm3z220egay",
      },
      {
        name: "mxc",
        address: "one1crz0g3jmphanhzught52pq0uak7v5yhdn8axr9",
      },
      {
        name: "h20 minter",
        address: "one18t4yj4fuutj83uwqckkvxp9gfa0568uc48ggj7",
      },
      {
        name: "busd minter",
        address: "one1p6wcwnajxc208uxpdlx9sqktt6t8kk8nw9hshf",
      },
    ],
  },
  mutations: {
    setPincode(state, payload) {
      state.auth.pincode = { ...payload };
    },
    setPindigits(state, payload) {
      state.auth.pindigits = payload;
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
      contactsArray.push(payload);
      commit("setContacts", contactsArray);
    },
    editContact({ commit, state }, payload) {
      const contactsArray = state.contacts;
      const index = _.findIndex(contactsArray, {
        address: payload.address,
      });
      if (index < 0) return;
      contactsArray[index] = { ...payload };
      commit("setContacts", contactsArray);
    },
    deleteContact({ commit, state }, payload) {
      const contactsArray = state.contacts;
      _.remove(contactsArray, { aaddress: payload.address });
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
