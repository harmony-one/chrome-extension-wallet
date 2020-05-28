"use strict";

const fs = require("fs");
const path = require("path");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const NODE_ENV = process.env.NODE_ENV;

if (!NODE_ENV) {
  throw new Error(
    "The NODE_ENV environment variable is required but was not specified."
  );
}

var dotenvFiles = [`${resolveApp(".env")}.${NODE_ENV}`].filter(Boolean);

console.log("dotenvFiles", dotenvFiles);

dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    require("dotenv-expand")(
      require("dotenv").config({
        path: dotenvFile,
      })
    );
  }
});

function getClientEnvironment() {
  const raw = {
    NODE_ENV: process.env.NODE_ENV || "development",
    WALLET_URL: process.env.WALLET_URL || "http://localhost:9080",
    MAX_ATTEMPTS: process.env.MAX_ATTEMPTS || 5,
    PRODUCTION: process.env.NODE_ENV === "production",
  };

  // Stringify all values so we can feed into Webpack DefinePlugin
  const stringified = {
    "process.env": Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };

  return { raw, stringified };
}

module.exports = getClientEnvironment;
