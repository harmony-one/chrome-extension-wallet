export function saveValue(value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(value, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

export function getValue(value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(value, items => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
      resolve(items);
    });
  });
}

export function removeValue(value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(value, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}
