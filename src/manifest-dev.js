const AppInfo = require("./app.json");

module.exports = {
  name: "Harmony One Wallet",
  description: "Harmony One Extension Wallet",
  author: "Harmony",
  version: AppInfo.version,
  icons: {
    "16": "icons/16.ico",
    "32": "icons/32.ico",
    "48": "icons/48.ico",
    "128": "icons/128.ico",
  },

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
  content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",
  web_accessible_resources: ["popup.html", "inject-script.js"],
};
