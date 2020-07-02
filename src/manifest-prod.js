/**
 * @see {@link https://developer.chrome.com/extensions/manifest}
 */
module.exports = {
  name: "Harmony One Wallet",
  description: "Harmony One Browser Extension Wallet",
  author: "Harmony",
  version: "1.0.2",
  icons: {
    "16": "icons/16.png",
    "32": "icons/32.png",
    "48": "icons/48.png",
    "128": "icons/128.png",
  },
  /**
   * @see {@link https://developer.chrome.com/extensions/declare_permissions}
   */
  permissions: ["storage", "tabs"],
  browser_action: {
    default_title: "Harmony One Wallet",
    default_popup: "popup.html",
  },
  background: {
    scripts: ["background.js"],
  },
  content_scripts: [
    {
      matches: ["*://*/*"],
      js: ["content-script.js"],
    },
  ],
  manifest_version: 2,
  content_security_policy: "script-src 'self'; object-src 'self'",
  web_accessible_resources: ["popup.html", "inject-script.js"],
};
