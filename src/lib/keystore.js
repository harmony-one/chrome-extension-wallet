import pbkdf2 from "pbkdf2";
import aesjs from "aes-js";
import store from "../popup/store";
import { encryptPhrase, getAddress, decryptPhrase } from "@harmony-js/crypto";
const {
  ChainID,
  ChainType,
  isValidAddress,
  Unit,
} = require("@harmony-js/utils");
import { Harmony } from "@harmony-js/core";

var currentNetwork = "";
var harmony = new Harmony(
  // rpc url
  store.state.network.apiUrl,
  {
    chainType: store.state.network.type, //ChainType.Harmony,
    chainId: store.state.network.chainId, //ChainID.HmyMainnet,
  }
);

const uuidv4 = require("uuid/v4");

/* Convert a byte to string */
function byte2hexStr(byte) {
  var hexByteMap = "0123456789ABCDEF";
  var str = "";
  str += hexByteMap.charAt(byte >> 4);
  str += hexByteMap.charAt(byte & 0x0f);
  return str;
}

function byteArray2hexStr(byteArray) {
  let str = "";
  for (let i = 0; i < byteArray.length; i++) {
    str += byte2hexStr(byteArray[i]);
  }
  return str;
}

function stringToBytes(str) {
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

function bytesToString(arr) {
  if (typeof arr === "string") {
    return arr;
  }
  let str = "",
    _arr = arr;
  for (let i = 0; i < _arr.length; i++) {
    let one = _arr[i].toString(2),
      v = one.match(/^1+?(?=0)/);
    if (v && one.length === 8) {
      let bytesLength = v[0].length;
      let store = _arr[i].toString(2).slice(7 - bytesLength);
      for (let st = 1; st < bytesLength; st++) {
        store += _arr[st + i].toString(2).slice(2);
      }
      str += String.fromCharCode(parseInt(store, 2));
      i += bytesLength - 1;
    } else {
      str += String.fromCharCode(_arr[i]);
    }
  }
  return str;
}

function isHexChar(c) {
  if (
    (c >= "A" && c <= "F") ||
    (c >= "a" && c <= "f") ||
    (c >= "0" && c <= "9")
  ) {
    return 1;
  }
  return 0;
}

function hexChar2byte(c) {
  var d = 0;
  if (c >= "A" && c <= "F") {
    d = c.charCodeAt(0) - "A".charCodeAt(0) + 10;
  } else if (c >= "a" && c <= "f") {
    d = c.charCodeAt(0) - "a".charCodeAt(0) + 10;
  } else if (c >= "0" && c <= "9") {
    d = c.charCodeAt(0) - "0".charCodeAt(0);
  }
  return d;
}

function hexStr2byteArray(str) {
  var byteArray = Array();
  var d = 0;
  var j = 0;
  var k = 0;

  for (let i = 0; i < str.length; i++) {
    var c = str.charAt(i);
    if (isHexChar(c)) {
      d <<= 4;
      d += hexChar2byte(c);
      j++;
      if (0 === j % 2) {
        byteArray[k++] = d;
        d = 0;
      }
    }
  }
  return byteArray;
}

export default function getHarmony() {
  if (currentNetwork != store.state.network.name) {
    currentNetwork = store.state.network.name;
    console.log("current network changed to", currentNetwork);
    harmony = new Harmony(
      // rpc url
      store.state.network.apiUrl,
      {
        chainType: store.state.network.type, //ChainType.Harmony,
        chainId: store.state.network.chainId, //ChainID.HmyMainnet,
      }
    );
  }

  return harmony;
}

export function encryptKey(password, salt) {
  return pbkdf2.pbkdf2Sync(password, salt, 1, 256 / 8, "sha512");
}

export function encryptString(password, hexString) {
  const textBytes = aesjs.utils.utf8.toBytes(hexString);
  const aesCtr = new aesjs.ModeOfOperation.ctr(password);
  const encrypted = aesCtr.encrypt(textBytes);

  return {
    bytes: encrypted,
    hex: aesjs.utils.hex.fromBytes(encrypted),
  };
}

export function decryptString(password, salt, hexString) {
  const key = encryptKey(password, salt);
  const encryptedBytes = aesjs.utils.hex.toBytes(hexString);
  const aesCtr = new aesjs.ModeOfOperation.ctr(key);
  const decryptedBytes = aesCtr.decrypt(encryptedBytes);

  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}

export function validatePrivateKey(privateKey) {
  try {
    const oneAddress = importPriveKey(privateKey);
    return isValidAddress(oneAddress);
  } catch (e) {
    return false;
  }
}

export function encryptKeyStore(password, privateKey, address) {
  const salt = uuidv4();
  const encryptedKey = encryptKey(password, salt);
  const { hex } = encryptString(encryptedKey, privateKey);

  const data = {
    version: 1,
    key: hex,
    address: address,
    salt,
  };

  return byteArray2hexStr(stringToBytes(JSON.stringify(data)));
}

export function decryptKeyStore(password, keystore) {
  if (!password) {
    return false;
  }
  let key, address, salt;
  try {
    const keyJson = JSON.parse(bytesToString(hexStr2byteArray(keystore)));
    key = keyJson.key;
    address = keyJson.address;
    salt = keyJson.salt;
  } catch (e) {
    return false;
  }

  console.log("password =", password);
  console.log("key =", key);
  console.log("address = ", address);
  console.log("salt = ", salt);

  const privateKey = decryptString(password, salt, key);

  console.log("privte key = ", privateKey);
  if (!validatePrivateKey(privateKey)) return false;
  const oneAddress = importPriveKey(privateKey);
  console.log("decrypted address = ", oneAddress);

  if (isValidAddress(oneAddress) && oneAddress === address) {
    return {
      address,
      privateKey,
    };
  }

  return false;
}

export function generatePhrase() {
  return getHarmony().wallet.newMnemonic();
}

export function createAccount(name, seed, password) {
  let account;
  try {
    account = getHarmony().wallet.addByMnemonic(seed);
  } catch (e) {
    return false;
  }
  let address = getAddress(account.address).bech32;
  let privateKey = account.privateKey;
  const keystore = encryptKeyStore(password, privateKey, address);
  return {
    name,
    address,
    keystore,
    keypass: password,
  };
}

export function importPriveKey(privateKey) {
  let account = getHarmony().wallet.addByPrivateKey(privateKey);
  let address = getAddress(account.address).bech32;
  return address;
}

// 0x1b4dc81bc7245c648e846c0d6f4d818425733a988aafa7030001b409bc71f27c
// one1jcq8d7afnsz4kj8yjt39wnljvj8qkx5ccydgd6
export async function getBalance(address, shardId) {
  getHarmony().blockchain.messenger.setDefaultShardID(shardId);
  let ret = await getHarmony().blockchain.getBalance({ address });

  return ret.result;
}

export async function getShardInfo() {
  //set sharding
  const res = await getHarmony().blockchain.getShardingStructure();
  getHarmony().shardingStructures(res.result);

  return res.result;
}

export function checkAddress(address) {
  return isValidAddress(address);
}

export async function transferToken(
  receiver,
  fromShard,
  toShard,
  amount,
  privateKey,
  gasLimit = "210000",
  gasPrice = 2
) {
  let harmony = getHarmony();

  //1e18
  const txn = harmony.transactions.newTx({
    //  token send to
    to: receiver,
    // amount to send
    value: new harmony.utils.Unit(amount)
      .asEther()
      .toWei()
      .toString(),
    // gas limit, you can use string
    gasLimit: gasLimit,
    // send token from shardID
    shardID:
      typeof fromShard === "string"
        ? Number.parseInt(fromShard, 10)
        : fromShard,
    // send token to toShardID
    toShardID:
      typeof toShard === "string" ? Number.parseInt(toShard, 10) : toShard,
    // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
    gasPrice: new harmony.utils.Unit(gasPrice)
      .asGwei()
      .toWei()
      .toString(),
  });

  // update the shard information
  await getShardInfo();

  // sign the transaction use wallet;
  const account = harmony.wallet.addByPrivateKey(privateKey);
  const signedTxn = await account.signTransaction(txn);

  signedTxn
    .observed()
    .on("transactionHash", (txnHash) => {
      console.log("--- hash ---");
      console.log(txnHash);
    })
    .on("error", (error) => {
      return {
        result: false,
        mesg: "failed to sign transaction",
      };
    });

  const [sentTxn, txnHash] = await signedTxn.sendTransaction();
  const confiremdTxn = await sentTxn.confirm(txnHash);

  var explorerLink;
  if (confiremdTxn.isConfirmed()) {
    explorerLink = getNetworkLink("/tx/" + txnHash);
    console.log(explorerLink);
  } else {
    return {
      result: false,
      mesg: "can not confirm transaction " + txnHash,
    };
  }

  return {
    result: true,
    mesg: explorerLink,
  };
}

export async function getTransfers(
  address,
  pageIndex,
  pageSize,
  order = "DESC"
) {
  let harmony = getHarmony();
  const ret = await harmony.messenger.send(
    "hmy_getTransactionsHistory",
    [
      {
        address: address,
        pageIndex: pageIndex,
        pageSize: pageSize,
        fullTx: true,
        txType: "ALL",
        order: "DESC",
      },
    ],
    harmony.messenger.chainPrefix,
    harmony.messenger.getCurrentShardID()
  );

  return ret.result;
}

export async function getTransactionCount(addr) {
  let harmony = getHarmony();

  // const ret = await harmony.blockchain.getTransactionCount( {address: 'one1zksj3evekayy90xt4psrz8h6j2v3hla4qwz4ur'})
  const ret = await harmony.blockchain.getTransactionCount({ address: addr });

  return parseInt(ret.result);
}

export function getNetworkLink(path) {
  var basic;
  switch (currentNetwork) {
    case "Mainnet": {
      basic = "https://explorer.harmony.one/#";
      break;
    }
    case "Pangaea": {
      basic = "https://explorer.pangaea.harmony.one/#";
      break;
    }
    case "Testnet": {
      basic = "https://explorer.testnet.harmony.one/#";
      break;
    }
    case "OpensSakingNet": {
      basic = "https://explorer.os.hmny.io/#";
      break;
    }
    case "Localnet": {
      basic = "";
      break;
    }
    default: {
      basic = "https://explorer.harmony.one/#";
      break;
    }
  }

  return basic + path;
}
