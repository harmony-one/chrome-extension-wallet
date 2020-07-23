import {
  THIRDPARTY_FORGET_IDENTITY_REQUEST_RESPONSE,
  THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE,
  THIRDPARTY_SIGN_REQUEST_RESPONSE,
  HARMONY_RESPONSE_TYPE,
  FROM_BACK_TO_POPUP,
  CLOSE_WINDOW,
} from "../types";
import * as storage from "./storage";

export const msgToContentScript = (type, payload) => ({
  type: HARMONY_RESPONSE_TYPE,
  message: {
    type,
    payload,
  },
});

class WalletService {
  constructor() {
    this.txnInfo = null;
    this.type = null;
    this.sender = null;
    this.host = "";
    this.activeSession = null;
  }
  getState = () => {
    return {
      type: this.type,
      host: this.host,
      txnInfo: this.txnInfo,
      session: this.activeSession,
    };
  };
  sendMessageToInjectScript = (type, payload) => {
    chrome.tabs.sendMessage(this.sender, msgToContentScript(type, payload));
  };
  openPopup = async (route, width, height) => {
    chrome.windows.getCurrent({ windowTypes: ["normal"] }, function(window) {
      chrome.windows.create({
        url: `chrome-extension://${chrome.runtime.id}/popup.html#/${route}`,
        type: "popup",
        left: screen.width / 2 - width / 2 + window.left,
        top: screen.height / 2 - height / 2 + window.top,
        width: width,
        height: height,
      });
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
    this.sendMessageToInjectScript(THIRDPARTY_FORGET_IDENTITY_REQUEST_RESPONSE);
  };
  getAccount = async (tabid, hostname) => {
    try {
      const store = this.getVuexStore();
      this.sender = tabid;
      this.host = hostname;
      const session = await this.getSession(hostname);
      if (session.exist) {
        const findAcc = store.wallets.accounts.find(
          (account) => account.address === session.account.address
        );
        if (!findAcc) {
          this.sendMessageToInjectScript(
            THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE,
            {
              rejected: true,
              message:
                "Account is not found from the extension. Please use forgetIdentity first to sign out",
            }
          );
          return;
        }
        this.sendMessageToInjectScript(
          THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE,
          session.account
        );
      } else this.openPopup("login", 420, 600);
    } catch (err) {
      this.sendMessageToInjectScript(THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE, {
        rejected: true,
        message: JSON.stringify(err),
      });
    }
  };
  isTokenTransfer = (data) => {
    return data && data !== "0x";
  };
  getVuexStore = () => {
    if (window.localStorage.vuex === undefined) return {};
    return JSON.parse(window.localStorage.vuex);
  };
  prepareSignTransaction = async (tabid, hostname, payload) => {
    try {
      const store = this.getVuexStore();
      this.sender = tabid;
      this.host = hostname;
      this.type = payload.type;
      this.txnInfo = payload.txnInfo;
      const session = await this.getSession(hostname);
      if (session.exist) {
        const findAcc = store.wallets.accounts.find(
          (account) => account.address === session.account.address
        );
        if (!findAcc) {
          this.sendMessageToInjectScript(THIRDPARTY_SIGN_REQUEST_RESPONSE, {
            rejected: true,
            message:
              "Account is not found from the extension. Please use forgetIdentity first to sign out",
          });
          return;
        }
        this.activeSession = session;
        if (this.isTokenTransfer(this.txnInfo.data))
          this.openPopup("sign", 400, 600);
        else this.openPopup("sign", 400, 550);
      } else {
        this.sendMessageToInjectScript(THIRDPARTY_SIGN_REQUEST_RESPONSE, {
          rejected: true,
          message:
            "Account is not selected. Please use getAccount first to sign the transaction",
        });
      }
    } catch (err) {
      this.sendMessageToInjectScript(THIRDPARTY_SIGN_REQUEST_RESPONSE, {
        rejected: true,
        message: JSON.stringify(err),
      });
    }
  };
  onGetSignatureKeySuccess = (payload) => {
    this.sendMessageToInjectScript(THIRDPARTY_SIGN_REQUEST_RESPONSE, payload);
    this.closeWindow();
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
    this.sendMessageToInjectScript(
      THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE,
      payload
    );
    this.closeWindow();
  };
  closeWindow = () => {
    chrome.runtime.sendMessage({
      type: FROM_BACK_TO_POPUP,
      action: CLOSE_WINDOW,
    });
  };
}
const walletService = new WalletService();

export default walletService;
