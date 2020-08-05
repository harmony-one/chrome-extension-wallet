import apiService from "../services/APIService";
import { msgToContentScript } from "../services/APIService";
import * as storage from "../services/StorageService";
import {
  HARMONY_REQUEST_TYPE,
  HARMONY_RESPONSE_TYPE,
  THIRDPARTY_FORGET_IDENTITY_REQUEST,
  THIRDPARTY_GET_ACCOUNT_REQUEST,
  THIRDPARTY_SIGN_REQUEST,
  THIRDPARTY_SIGNATURE_KEY_SUCCESS_RESPONSE,
  GET_WALLET_SERVICE_STATE,
  THIRDPARTY_SIGN_CONNECT,
  THIRDPARTY_GET_ACCOUNT_SUCCESS_RESPONSE,
  THIRDPARTY_GET_ACCOUNT_CONNECT,
  APP_CONNECT,
  THIRDPARTY_SIGN_REQUEST_RESPONSE,
  THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE,
} from "../types";

function externalMessageListener(message, sender, sendResponse) {
  const { messageSource, payload } = message;

  if (!messageSource || !payload || messageSource !== HARMONY_REQUEST_TYPE) {
    return false;
  }

  const { type } = payload;
  switch (type) {
    case THIRDPARTY_SIGN_REQUEST:
      apiService.prepareSignTransaction(
        sender.tab.id,
        payload.hostname,
        payload.payload
      );
      break;
    case THIRDPARTY_GET_ACCOUNT_REQUEST:
      apiService.getAccount(sender.tab.id, payload.hostname);
      break;
    case THIRDPARTY_FORGET_IDENTITY_REQUEST:
      apiService.forgetIdentity(sender.tab.id, payload.hostname);
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
    case THIRDPARTY_GET_ACCOUNT_SUCCESS_RESPONSE:
      apiService.onGetAccountSuccess(payload);
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
  externalPort.onDisconnect.addListener(function() {
    if (name !== APP_CONNECT) {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          setTimeout(() => {
            switch (name) {
              case THIRDPARTY_SIGN_CONNECT: {
                chrome.tabs.sendMessage(
                  tab.id,
                  msgToContentScript(THIRDPARTY_SIGN_REQUEST_RESPONSE, {
                    rejected: true,
                  })
                );
                break;
              }
              case THIRDPARTY_GET_ACCOUNT_CONNECT: {
                chrome.tabs.sendMessage(
                  tab.id,
                  msgToContentScript(THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE, {
                    rejected: true,
                  })
                );
                break;
              }
            }
          }, 200);
        });
      });
    } else {
      storage.saveValue({
        lastClosed: Date.now(),
      });
    }
  });
}
export function setupExtensionMessageListeners() {
  chrome.runtime.onMessage.addListener(externalMessageListener);
  chrome.runtime.onMessage.addListener(internalMessageListener);
  chrome.runtime.onConnect.addListener(onConnectListener);
}
