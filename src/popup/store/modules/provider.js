import _ from "lodash";
export default {
  namespaced: true,
  state: {
    sessions: [],
  },
  actions: {
    revokeSession({ commit, state }, payload) {
      const index = payload;
      const { sessions } = state;
      sessions.splice(index, 1);
      commit("setSessions", sessions);
    },
    switchAccount({ commit, state }, payload) {
      const { host, index } = payload;
      const { sessions } = state;
      const findIndexByHost = _.findIndex(sessions, { host });
      if (findIndexByHost < 0) return;
      const temp = sessions[findIndexByHost].accounts[index];
      sessions[findIndexByHost].accounts.splice(index, 1);
      sessions[findIndexByHost].accounts.unshift(temp);
      commit("setSessions", sessions);
    },
    disconnectAccount({ commit, state }, payload) {
      const { host, index } = payload;
      const { sessions } = state;
      const findIndexByHost = _.findIndex(sessions, { host });
      if (findIndexByHost < 0) return;
      sessions[findIndexByHost].accounts.splice(index, 1);
      commit("setSessions", sessions);
    },
    setAccounts({ commit, state }, payload) {
      const { host, accounts } = payload;
      const { sessions } = state;
      const findIndexByHost = _.findIndex(sessions, { host });
      if (findIndexByHost < 0) {
        commit("addSession", payload);
        return;
      }
      sessions[findIndexByHost].accounts = [...accounts];
      commit("setSessions", sessions);
    },
    addAccount({ commit, state }, payload) {
      const { host, address } = payload;
      const { sessions } = state;
      const findIndexByHost = _.findIndex(sessions, { host });
      if (findIndexByHost < 0) return;
      sessions[findIndexByHost].accounts.unshift(address);
      commit("setSessions", sessions);
    },
  },
  mutations: {
    setSessions(state, payload) {
      state.sessions = payload;
    },
    addSession(state, payload) {
      state.sessions.push(payload);
    },
  },
};
