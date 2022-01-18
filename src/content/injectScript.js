import walletProvider from "./WalletProvider";

Object.defineProperty(window, "onewallet", {
  enumerable: false,
  writable: false,
  configurable: false,
  value: walletProvider,
});
