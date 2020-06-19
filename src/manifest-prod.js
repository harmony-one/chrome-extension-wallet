/**
 * @see {@link https://developer.chrome.com/extensions/manifest}
 */
module.exports = {
  name: "Harmony Wallet",
  description: "Harmony Browser Extension Wallet",
  author: "Harmony",
  version: "1.0.0",
  icons: {
    "16": "icons/16.png",
    "32": "icons/32.png",
    "48": "icons/48.png",
    "128": "icons/128.png",
  },
  /**
   * @see {@link https://developer.chrome.com/extensions/declare_permissions}
   */
  permissions: [
    "storage",
    "https://staking.harmony.one/",
    "https://staking-explorer.firebaseapp.com/",
  ],
  browser_action: {
    default_title: "Harmony Wallet",
    default_popup: "popup.html",
  },
  background: {
    scripts: ["background.js"],
  },
  content_scripts: [
    {
      matches: [
        "https://*.harmony.one/*",
        "https://staking-explorer.firebaseapp.com/*",
      ],
      js: ["content-script.js"],
    },
  ],
  manifest_version: 2,
  content_security_policy: "script-src 'self'; object-src 'self'",
  web_accessible_resources: ["popup.html", "inject-script.js"],
};
