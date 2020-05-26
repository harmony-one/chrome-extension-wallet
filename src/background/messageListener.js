import extensionService from "../services/index";
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
    default:
      console.warn("Unk message received from content script - ", message);
  }
  return true;
}

// Listen messages from extension (e.g popup)
function internalMessageListener(message, sender, sendResponse) {
  const { messageSource, action, payload } = message;
  if (messageSource && messageSource !== "FROM_ONEWALLET_EXTENSION") {
    return false;
  }

  switch (action) {
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
    }
    default:
      console.log("Unk internal action received - ", action);
  }
  return true;
}
export function setupExtensionMessageListeners() {
  chrome.runtime.onMessage.addListener(externalMessageListener);
  chrome.runtime.onMessage.addListener(internalMessageListener);
}
