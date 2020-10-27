import {
  HARMONY_REQUEST_TYPE,
  HARMONY_RESPONSE_TYPE,
  ONEWALLET_SERVICE_EVENT_REQUEST,
  ONEWALLET_SERVICE_EVENT_RESPONSE,
  ONEWALLETPROVIDER_MESSAGE_LISTENER,
} from "~/types";

window.onerror = function(message, error) {
  console.error("One Wallet service call failed,", message, ", error: ", error);
};

// Content script

window.addEventListener(
  ONEWALLET_SERVICE_EVENT_REQUEST,
  function(event) {
    if (
      !event.detail ||
      !event.detail.type ||
      event.detail.type !== HARMONY_REQUEST_TYPE
    ) {
      return;
    }
    const { payload } = event.detail;
    chrome.runtime.sendMessage({
      payload,
      messageSource: HARMONY_REQUEST_TYPE,
    });
  },
  false
);

// Listen message from extension background page/popup and re-send to current window (dashboard page)
chrome.runtime.onMessage.addListener(async (message) => {
  if (!message || !message.type || message.type !== HARMONY_RESPONSE_TYPE) {
    return false;
  }
  window.dispatchEvent(
    new CustomEvent(ONEWALLET_SERVICE_EVENT_RESPONSE, {
      detail: message,
    })
  );
  return true;
});
chrome.runtime.onMessage.addListener(async (event) => {
  if (!event || !event.type || event.type !== HARMONY_RESPONSE_TYPE) {
    return false;
  }
  window.dispatchEvent(
    new CustomEvent(ONEWALLET_SERVICE_EVENT_RESPONSE, {
      detail: event,
    })
  );
  return true;
});
//wallet provider event listener
chrome.runtime.onMessage.addListener(async (event) => {
  if (
    !event ||
    !event.type ||
    event.type !== ONEWALLETPROVIDER_MESSAGE_LISTENER
  ) {
    return false;
  }
  const { message } = event;
  if (!message) return true;
  window.dispatchEvent(
    new CustomEvent(ONEWALLETPROVIDER_MESSAGE_LISTENER, {
      detail: message,
    })
  );
  return true;
});

try {
  const node = document.head || document.documentElement;
  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", chrome.extension.getURL("inject-script.js"));
  node.appendChild(script);
  console.info("Onewallet provider injected");
} catch (e) {
  console.error("Onewallet provider injection failed", e);
}
