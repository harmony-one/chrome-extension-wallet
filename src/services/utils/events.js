import { ADD_LOG } from "../../types";

export function sendEventLog(payload) {
    console.log("try send", payload)
    chrome.runtime.sendMessage({
        action: ADD_LOG,
        payload,
    });
}
