import { setupExtensionMessageListeners } from "./messageListener";
import apiService from "services/APIService";
import * as storage from "services/StorageService";
setupExtensionMessageListeners();

const getHostSessions = async () => {
  let currentSession = await storage.getValue("session");
  let sessionList = [];
  if (currentSession && Array.isArray(currentSession.session))
    sessionList = currentSession.session;
  return sessionList;
};

const updateSessionStorage = async () => {
  let sessionList = await getHostSessions();
  let newSessionList = [];
  sessionList.forEach((session) => {
    let newSession = {};
    newSession.host = session.host;
    if (session.account) {
      newSessionList.push({
        host: session.host,
        accounts: [session.account.address],
      });
    } else newSessionList.push(session);
  });
  // await storage.saveValue({
  //   session: newSessionList,
  // });
};
updateSessionStorage();
