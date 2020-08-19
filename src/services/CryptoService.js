import aesjs from "aes-js";

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
