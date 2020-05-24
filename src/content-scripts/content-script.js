const HARMONY_EXTENSION_MESSAGE = "FROM_HARMON_IO";

window.onerror = function(message, source, line, column, error) {
  console.log("ONE ERROR HANDLER TO RULE THEM ALL:", message);
};

window.addEventListener(
  "message",
  (event) => {
    console.log("onewallet---->", event);
    if (event.source !== window) {
      return;
    }

    if (
      !event.data ||
      !event.data.type ||
      event.data.type !== HARMONY_EXTENSION_MESSAGE
    ) {
      return;
    }

    const { payload } = event.data;
    chrome.runtime.sendMessage(
      {
        payload,
        messageSource: HARMONY_EXTENSION_MESSAGE,
      },
      (response) => {
        window.postMessage(response);
      }
    );
  },
  false
);

// Listen message from extension background page/popup and re-send to current window (dashboard page)
chrome.runtime.onMessage.addListener(async (message) => {
  console.log(message);
  if (
    !message ||
    !message.type ||
    message.type !== "FROM_ONEWALLET_EXTENSION"
  ) {
    return true;
  }
  window.postMessage(message);
  return true;
});

// Tell website that lunie(harmony) extension is available
window.postMessage({
  type: "FROM_ONEWALLET_EXTENSION",
  message: { type: "INIT_EXTENSION" },
});
