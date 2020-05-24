// Handle messages from outside extension (eg dashboard app)
function externalMessageListener(message, sender, sendResponse) {
  const { messageSource, payload } = message;

  if (!messageSource || !payload || messageSource !== "FROM_HARMON_IO") {
    return;
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

    default:
      console.warn("Unk message received from content script - ", message);
  }
}

export function setupExtensionMessageListeners() {
  chrome.runtime.onMessage.addListener(externalMessageListener);
}
