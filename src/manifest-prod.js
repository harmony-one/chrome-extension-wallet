const AppInfo = require("./app.json");

module.exports = {
  name: "Harmony Chrome Extension Wallet",
  description: "Harmony Chrome Extension Wallet",
  author: "Harmony",
  version: AppInfo.version,
  icons: {
    16: "icons/16.ico",
    32: "icons/32.ico",
    48: "icons/48.ico",
    128: "icons/128.ico",
  },

  permissions: ["storage"],
  browser_action: {
    default_title: "Harmony Chrome Extension Wallet",
    default_popup: "popup.html",
  },
  background: {
    scripts: ["background.js"],
  },
  content_scripts: [
    {
      matches: ["file://*/*", "http://*/*", "https://*/*"],
      js: ["content-script.js"],
      run_at: "document_start",
      all_frames: true,
    },
  ],
  manifest_version: 2,
  content_security_policy: "script-src 'self'; object-src 'self'",
  web_accessible_resources: ["inject-script.js"],
};
