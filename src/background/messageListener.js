import extensionService from "../services/extensionService";
import walletService from "../services/walletService";
import { msgToContentScript } from "../services/frontMessages";
function externalMessageListener(message, sender, sendResponse) {
  const { messageSource, payload } = message;

  if (
    !messageSource ||
    !payload ||
    messageSource !== "TO_ONEWALLET_EXTENSION"
  ) {
    return false;
  }

  const { type } = payload;
  switch (type) {
    case "GET_SESSION":
      sendResponse({
        type: "FROM_ONEWALLET_EXTENSION",
        message: {
          type: "GET_SESSION_RESPONSE",
          payload: {
            extensionId: chrome.runtime.id,
          },
        },
      });
      break;
    case "ONEWALLET_SIGN_REQUEST":
      extensionService.prepareSignTransaction(payload.payload, sender.tab.id);
      break;
    case "ONEWALLET_LOGIN_REQUEST":
      extensionService.startLogIn(sender.tab.id);
      break;
    case "THIRDPARTY_SIGN_REQUEST":
      walletService.prepareSignTransaction(
        sender.tab.id,
        payload.hostname,
        payload.payload
      );
      break;
    case "THIRDPARTY_GET_ACCOUNT_REQUEST":
      walletService.getAccount(sender.tab.id, payload.hostname);
      break;
    default:
      console.warn("Unk message received from content script - ", message);
  }
  sendResponse();
  return true;
}

// Listen messages from extension (e.g popup)
function internalMessageListener(message, sender, sendResponse) {
  const { messageSource, action, payload } = message;
  if (messageSource && messageSource !== "FROM_ONEWALLET_EXTENSION") {
    return false;
  }
  switch (action) {
    //start onewallet provider message
    case "GET_WALLET_SERVICE_STATE": {
      const state = walletService.getState();
      sendResponse({ state });
      break;
    }
    case "THIRDPARTY_SIGNATURE_KEY_SUCCESS_RESPONSE":
      walletService.onGetSignatureKeySuccess(payload);
      break;
    case "THIRDPARTY_GET_ACCOUNT_SUCCESS_RESPONSE":
      walletService.onGetAccountSuccess(payload);
      break;
    //end onewallet provider message
    //start staking dashboard message handler
    case "GET_EXTENSION_STATE": {
      const state = extensionService.getState();
      sendResponse({ state });
      break;
    }
    case "REJECT_TRANSACTION":
      extensionService.closeSession();
      break;
    case "SIGN_TRANSACTION":
      extensionService.signTransaction(payload);
      break;
    case "RESET_WINDOW_STATE":
      extensionService.resetWindowState();
      break;
    case "LOGGED_IN": {
      extensionService.loginWithExtension(payload);
      break;
      //end staking dashboard message handler
    }
    default:
      console.log("Unk internal action received - ", action);
  }
  sendResponse();
  return true;
}
//disconnect listener when the popup is close
function onConnectListener(externalPort) {
  const name = externalPort.name;
  externalPort.onDisconnect.addListener(function() {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        switch (name) {
          case "THIRDPARTY_SIGN": {
            chrome.tabs.sendMessage(
              tab.id,
              msgToContentScript("THIRDPARTY_SIGN_REQUEST_RESPONSE", {
                rejected: true,
              })
            );
            break;
          }
          case "THIRDPARTY_GET_ACCOUNT": {
            chrome.tabs.sendMessage(
              tab.id,
              msgToContentScript("THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE", {
                rejected: true,
              })
            );
            break;
          }
        }
      });
    });
  });
}
export function setupExtensionMessageListeners() {
  chrome.runtime.onMessage.addListener(externalMessageListener);
  chrome.runtime.onMessage.addListener(internalMessageListener);
  chrome.runtime.onConnect.addListener(onConnectListener);
}
