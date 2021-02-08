import apiService from "services/APIService";
import { msgToContentScript } from "services/APIService";
import * as storage from "services/StorageService";
import {
  HARMONY_REQUEST_TYPE,
  HARMONY_RESPONSE_TYPE,
  THIRDPARTY_FORGET_IDENTITY_REQUEST,
  THIRDPARTY_GET_ACCOUNT_REQUEST,
  THIRDPARTY_SIGN_REQUEST,
  THIRDPARTY_SIGNATURE_KEY_SUCCESS_RESPONSE,
  THIRDPARTY_SIGNATURE_KEY_REJECT_RESPONSE,
  THIRDPARTY_PERSONAL_SIGN_SUCCESS_RESPONSE,
  THIRDPARTY_PERSONAL_SIGN_REJECT_RESPONSE,
  GET_WALLET_SERVICE_STATE,
  THIRDPARTY_SIGN_CONNECT,
  THIRDPARTY_PERSONAL_SIGN_CONNECT,
  THIRDPARTY_PERSONAL_SIGN_REQUEST,
  THIRDPARTY_GET_ACCOUNT_SUCCESS_RESPONSE,
  THIRDPARTY_GET_ACCOUNT_CONNECT,
  APP_CONNECT,
  THIRDPARTY_GET_ACCOUNT_REJECT_RESPONSE,
  GET_TAB_ID_INNER_EVENT_REQUEST,
  POPUP_CLOSED,
} from "~/types";
import * as lock from "./lock";

function externalMessageListener(message, sender, sendResponse) {
  const { messageSource, payload } = message;

  if (!messageSource || !payload || messageSource !== HARMONY_REQUEST_TYPE) {
    return false;
  }

  if (lock.isLocked(sender)) {
    sendResponse({ isLocked: true });
    console.log("Wallet is currently locked by other tab");
    return;
  }
  lock.lock(sender);
  const { type } = payload;
  switch (type) {
    case THIRDPARTY_SIGN_REQUEST:
      apiService.prepareSignTransaction(sender, payload.payload);
      break;
    case THIRDPARTY_GET_ACCOUNT_REQUEST:
      apiService.getAccount(sender);
      break;
    case THIRDPARTY_PERSONAL_SIGN_REQUEST:
      console.log("THIRDPARTY_PERSONAL_SIGN_REQUEST ===> ", payload);
      apiService.sign(sender, payload.payload);
      break;
    case THIRDPARTY_FORGET_IDENTITY_REQUEST:
      apiService.forgetIdentity(sender);
      break;
    default:
      console.warn("Unknown message from content script - ", message);
  }
  sendResponse();
  return true;
}

// Listen messages from extension (e.g popup)
function internalMessageListener(message, sender, sendResponse) {
  const { messageSource, action, payload } = message;
  if (messageSource && messageSource !== HARMONY_RESPONSE_TYPE) {
    return false;
  }
  switch (action) {
    case GET_WALLET_SERVICE_STATE: {
      const state = apiService.getState();
      sendResponse({ state });
      break;
    }
    case THIRDPARTY_SIGNATURE_KEY_SUCCESS_RESPONSE:
      apiService.onGetSignatureKeySuccess(payload);
      break;
    case THIRDPARTY_SIGNATURE_KEY_REJECT_RESPONSE:
      apiService.onGetSignatureKeyReject(payload);
      break;
    case THIRDPARTY_PERSONAL_SIGN_SUCCESS_RESPONSE:
      apiService.onPersonalSignSuccess(payload);
      break;
    case THIRDPARTY_PERSONAL_SIGN_REJECT_RESPONSE:
      apiService.onPersonalSignReject(payload);
      break;
    case THIRDPARTY_GET_ACCOUNT_SUCCESS_RESPONSE:
      apiService.onGetAccountSuccess(payload);
      break;
    case THIRDPARTY_GET_ACCOUNT_REJECT_RESPONSE:
      apiService.onGetAccountReject(payload);
      break;
    default:
      console.log("Unknown internal action received - ", action);
  }
  sendResponse();
  return true;
}

//disconnect listener when the popup is close
function onConnectListener(externalPort) {
  const name = externalPort.name;
  externalPort.onDisconnect.addListener(async function() {
    if (name !== APP_CONNECT) {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          setTimeout(() => {
            switch (name) {
              case THIRDPARTY_SIGN_CONNECT:
              case THIRDPARTY_PERSONAL_SIGN_CONNECT:
              case THIRDPARTY_GET_ACCOUNT_CONNECT: {
                chrome.tabs.sendMessage(
                  tab.id,
                  msgToContentScript(POPUP_CLOSED, {
                    rejected: true,
                    sender: tab.id,
                  })
                );
                lock.unlock();
                break;
              }
            }
          }, 200);
        });
      });
    } else {
      const { AppState } = await storage.getValue("AppState");
      storage.saveValue({
        AppState: { ...AppState, lastClosed: Date.now() },
      });
    }
  });
}

export function getTabId({ action }, sender, sendResponse) {
  if (action !== GET_TAB_ID_INNER_EVENT_REQUEST) {
    return false;
  }

  sendResponse(sender.tab.id);
  return true;
}

export function setupExtensionMessageListeners() {
  chrome.runtime.onMessage.addListener(getTabId);
  chrome.runtime.onMessage.addListener(externalMessageListener);
  chrome.runtime.onMessage.addListener(internalMessageListener);
  chrome.runtime.onConnect.addListener(onConnectListener);
}
