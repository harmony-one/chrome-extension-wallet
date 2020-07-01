import { WINDOWSTATE } from "./types";
import * as storage from "./storage";
import { msgToContentScript } from "./frontMessages";
class WalletService {
  txnInfo = null;
  type = null;
  sender = null;
  host = "";
  activeSession = null;
  getState = () => {
    return {
      type: this.type,
      txnInfo: this.txnInfo,
      session: activeSession,
    };
  };
  openPopup = (route, width, height) => {
    chrome.windows.create({
      url: `chrome-extension://${chrome.runtime.id}/popup.html#/${route}`,
      type: "panel",
      left: (screen.width - width) / 2,
      top: (screen.height - height) / 2,
      width: width,
      height: height,
    });
  };
  forgetIdentity = async (tabid, hostname) => {
    this.sender = tabid;
    this.host = hostname;

    let sessionList = await this.getHostSessions();
    const existIndex = sessionList.findIndex((elem) => elem.host === hostname);
    if (existIndex >= 0) {
      sessionList.splice(existIndex, 1);
      await storage.saveValue({
        session: sessionList,
      });
    }
    chrome.tabs.sendMessage(
      this.sender,
      msgToContentScript("THIRDPARTY_FORGET_IDENTITY_REQUEST_RESPONSE")
    );
  };
  getAccount = async (tabid, hostname) => {
    this.sender = tabid;
    this.host = hostname;
    const session = await this.getSession(hostname);
    if (session.exist) {
      chrome.tabs.sendMessage(
        this.sender,
        msgToContentScript(
          "THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE",
          session.account
        )
      );
    } else this.openPopup("login", 380, 600);
  };
  prepareSignTransaction = async (tabid, hostname, payload) => {
    try {
      this.sender = tabid;
      this.host = hostname;
      this.type = payload.type;
      this.txnInfo = payload.txnInfo;
      const session = await this.getSession(hostname);
      if (session.exist) {
        this.activeSession = session;
        this.openPopup("sign", 400, 560);
      } else {
        chrome.tabs.sendMessage(
          this.sender,
          msgToContentScript("THIRDPARTY_SIGN_REQUEST_RESPONSE", {
            rejected: true,
            message: "Account is not selected",
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };
  onGetSignatureKeySuccess = (payload) => {
    chrome.tabs.sendMessage(
      this.sender,
      msgToContentScript("THIRDPARTY_SIGN_REQUEST_RESPONSE", payload)
    );
    this.closeWindow();
  };
  closeWindow = () => {
    chrome.runtime.sendMessage({
      type: "FROM_BACK_TO_POPUP",
      action: "STATE_CHANGE",
      payload: {
        status: WINDOWSTATE.CLOSE,
      },
    });
  };
  getHostSessions = async () => {
    let currentSession = await storage.getValue("session");
    let sessionList = [];
    if (currentSession && Array.isArray(currentSession.session))
      sessionList = currentSession.session;
    return sessionList;
  };
  getSession = async (hostname) => {
    let sessionList = await this.getHostSessions();
    const existIndex = sessionList.findIndex((elem) => elem.host === hostname);
    if (existIndex >= 0) {
      return {
        exist: true,
        ...sessionList[existIndex],
      };
    }
    return {
      exist: false,
    };
  };

  onGetAccountSuccess = async (payload) => {
    let sessionList = await this.getHostSessions();
    const newHost = {
      host: this.host,
      account: payload,
    };
    sessionList.push(newHost);
    await storage.saveValue({
      session: sessionList,
    });
    chrome.tabs.sendMessage(
      this.sender,
      msgToContentScript("THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE", payload)
    );
    this.closeWindow();
  };
  resetState = () => {
    this.txnInfo = null;
    this.type = null;
    this.sender = null;
    this.host = "";
    this.activeSession = null;
  };
}
const walletService = new WalletService();

export default walletService;
