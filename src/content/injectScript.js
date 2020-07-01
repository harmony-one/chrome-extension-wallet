import walletProvider from "./WalletProvider";

Object.defineProperty(window, "onewallet", {
  enumerable: true,
  writable: true,
  configurable: true,
  value: walletProvider,
});
