import { WINDOWSTATE } from "./types";
import * as frontMessages from "./frontMessages";
class ExtensionService {
  status = WINDOWSTATE.NONE;
  senderTabID = null;
  getState = () => {
    return {
      status: this.status,
    };
  };
  setPopupStatus(status) {
    this.status = WINDOWSTATE.CLOSE;
    chrome.runtime.sendMessage({
      type: "FROM_BACK_TO_POPUP",
      payload: this.getState(),
    });
  }
  closeSession() {
    chrome.tabs.query({}, (tabs) =>
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, frontMessages.closeSession());
      })
    );

    this.resetState();
  }
  sendMessageToFront(messageObject) {
    chrome.tabs.sendMessage(this.senderTabID, messageObject);
  }
  startLogIn = (tabid) => {
    this.status = WINDOWSTATE.LOGIN;
    this.senderTabID = tabid;
  };
  loginWithExtension = (address) => {
    this.setPopupStatus(WINDOWSTATE.CLOSE);
    this.sendMessageToFront(frontMessages.loginResponse(address));
  };
  resetState = () => {
    this.senderTabID = null;
    this.status = WINDOWSTATE.NONE;
  };
}

const extensionService = new ExtensionService();

export default extensionService;
