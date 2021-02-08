import aesjs from "aes-js";
import {
  bufferToHex,
  calculateSigRecovery,
  toBuffer,
  setLengthLeft,
  isValidSigRecovery,
} from "./utils/eth-util";
export function encryptString(data, salt) {
  const textBytes = aesjs.utils.utf8.toBytes(data);
  const aesCtr = new aesjs.ModeOfOperation.ctr(aesjs.utils.utf8.toBytes(salt));
  const encrypted = aesCtr.encrypt(textBytes);

  return aesjs.utils.hex.fromBytes(encrypted);
}

export function decryptString(data, salt) {
  const encryptedBytes = aesjs.utils.hex.toBytes(data);
  const aesCtr = new aesjs.ModeOfOperation.ctr(aesjs.utils.utf8.toBytes(salt));
  const decryptedBytes = aesCtr.decrypt(encryptedBytes);

  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}

export function stringToHex(str) {
  if (str === "") {
    return "";
  }
  let arr = [];
  arr.push("0x");
  for (let i = 0; i < str.length; i++) {
    arr.push(str.charCodeAt(i).toString(16));
  }
  return arr.join("");
}

export const toRpcSig = (v, r, s, chainId) => {
  const recovery = calculateSigRecovery(v, chainId);
  if (!isValidSigRecovery(recovery)) {
    throw new Error("Invalid signature v value");
  }

  // geth (and the RPC eth_sign method) uses the 65 byte format used by Bitcoin
  return bufferToHex(
    Buffer.concat([setLengthLeft(r, 32), setLengthLeft(s, 32), toBuffer(v)])
  );
};
