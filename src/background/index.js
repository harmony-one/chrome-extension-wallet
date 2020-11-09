import { setupExtensionMessageListeners } from "./messageListener";
import apiService from "services/APIService";
import * as storage from "services/StorageService";
setupExtensionMessageListeners();

const updateSessionStorage = async () => {
  let sessionList = await apiService.getHostSessions();
  let newSessionList = [];
  sessionList.forEach((session) => {
    let newSession = {};
    newSession.host = session.host;
    if (session.account) {
      newSessionList.push({
        host: session.host,
        accounts: [{ ...session.account }],
      });
    } else newSessionList.push(session);
  });
  await storage.saveValue({
    session: newSessionList,
  });
};
updateSessionStorage();
