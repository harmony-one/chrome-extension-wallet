import walletController from "../services/walletController";

Object.defineProperty(window, "onewallet", {
  enumerable: true,
  writable: true,
  configurable: true,
  value: walletController,
});
