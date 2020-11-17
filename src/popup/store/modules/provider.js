import _ from "lodash";
import { sendEventToContentScript } from "services/APIService";
export default {
  namespaced: true,
  state: {
    sessions: [],
  },
  actions: {
    updateAllSessions({ commit, state }, payload) {
      const { newAddr } = payload;
      const { sessions } = state;
      const newSessions = sessions.map((session) => {
        const index = session.accounts.findIndex((elem) => elem === newAddr);
        if (index >= 0) {
          session.accounts.splice(index, 1);
          session.accounts.unshift(newAddr);
          return session;
        }
        return session;
      });
      const hosts = sessions.reduce((filtered, session) => {
        if (session.accounts.includes(newAddr) && session.host)
          filtered.push(session.host);
        return filtered;
      }, []);
      if (hosts.length > 0)
        sendEventToContentScript("accountChanged", {
          hosts: [...hosts],
          accounts: [newAddr],
        });
      commit("setSessions", newSessions);
    },
    disconnectAccount({ commit, state }, payload) {
      const { host, index } = payload;
      const { sessions } = state;
      const findIndexByHost = _.findIndex(sessions, { host });
      if (findIndexByHost < 0) return;
      sessions[findIndexByHost].accounts.splice(index, 1);
      const accounts = sessions[findIndexByHost].accounts;
      if (index === 0)
        sendEventToContentScript("accountChanged", {
          hosts: [host],
          accounts: accounts.length ? [accounts[0]] : [],
        });
      commit("setSessions", sessions);
    },
    setAccounts({ commit, state }, payload) {
      const { host, accounts, active } = payload;
      if (accounts.includes(active)) {
        const index = accounts.findIndex((acc) => acc === active);
        if (index < 0) return;
        accounts.splice(index, 1);
        accounts.unshift(active);
      }
      const { sessions } = state;
      const findIndexByHost = _.findIndex(sessions, { host });
      if (findIndexByHost < 0) {
        commit("addSession", {
          host,
          accounts,
        });
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
      sendEventToContentScript("accountChanged", {
        hosts: [host],
        accounts: [address],
      });
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
