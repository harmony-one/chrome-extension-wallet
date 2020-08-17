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

export function byte2hexStr(byte) {
  var hexByteMap = "0123456789ABCDEF";
  var str = "";
  str += hexByteMap.charAt(byte >> 4);
  str += hexByteMap.charAt(byte & 0x0f);
  return str;
}

export function byteArray2hexStr(byteArray) {
  let str = "";
  for (let i = 0; i < byteArray.length; i++) {
    str += byte2hexStr(byteArray[i]);
  }
  return str;
}

export function stringToBytes(str) {
  var bytes = new Array();
  var len, c;
  len = str.length;
  for (var i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if (c >= 0x010000 && c <= 0x10ffff) {
      bytes.push(((c >> 18) & 0x07) | 0xf0);
      bytes.push(((c >> 12) & 0x3f) | 0x80);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00ffff) {
      bytes.push(((c >> 12) & 0x0f) | 0xe0);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007ff) {
      bytes.push(((c >> 6) & 0x1f) | 0xc0);
      bytes.push((c & 0x3f) | 0x80);
    } else {
      bytes.push(c & 0xff);
    }
  }
  return bytes;
}
