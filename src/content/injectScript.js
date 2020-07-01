import walletProvider from "./WalletProvider";

Object.defineProperty(window, "onewallet", {
  enumerable: true,
  writable: false,
  configurable: false,
  value: walletProvider,
});
