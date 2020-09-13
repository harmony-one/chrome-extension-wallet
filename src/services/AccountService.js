import store from "../popup/store";
import {
  encryptPhrase,
  getAddress,
  decryptPhrase,
  HarmonyAddress,
} from "@harmony-js/crypto";
import { stringToHex } from "./CryptoService";
const { isValidAddress } = require("@harmony-js/utils");
import { Harmony } from "@harmony-js/core";
var currentNetwork = "";

var harmony = new Harmony(
  // rpc url
  store.state.network.apiUrl,
  {
    chainType: store.state.network.type,
    chainId: store.state.network.chainId, //ChainID.HmyMainnet,
  }
);
export function getHarmony() {
  if (currentNetwork != store.state.network.name) {
    currentNetwork = store.state.network.name;
    console.log("current network changed to", store.state.network.name);
    harmony = new Harmony(
      // rpc url
      store.state.network.apiUrl,
      {
        chainType: store.state.network.type,
        chainId: store.state.network.chainId, //ChainID.HmyMainnet,
      }
    );
  }

  return harmony;
}

export function validatePrivateKey(privateKey) {
  try {
    const oneAddress = getAddressFromPrivateKey(privateKey);
    return isValidAddress(oneAddress);
  } catch (e) {
    return false;
  }
}

export async function encryptKeyStore(password, privateKey) {
  const keyStore = await encryptPhrase(privateKey, password);
  return keyStore;
}

export async function decryptKeyStoreFromFile(password, keystore) {
  try {
    const decryptedAccount = await getHarmony().wallet.addByKeyStore(
      JSON.stringify(keystore),
      password
    );

    const address = decryptedAccount.address;
    const privateKey = decryptedAccount.privateKey;

    if (isValidAddress(address)) {
      return {
        address: new HarmonyAddress(address).bech32,
        privateKey,
      };
    }
    return false;
  } catch (err) {
    console.error("decryptKeyStoreFromFile--->", err);
    return false;
  }
}

export async function decryptKeyStore(password, keystore) {
  if (!password) {
    return false;
  }

  var privateKey;
  try {
    privateKey = await decryptPhrase(JSON.parse(keystore), password);
  } catch (e) {
    console.error("decryptKeyStore-->", e);
    return false;
  }
  return privateKey;
}

export function generatePhrase() {
  return getHarmony().wallet.newMnemonic();
}

export function validateMnemonic(mnemonic) {
  let account;
  try {
    account = getHarmony().wallet.addByMnemonic(mnemonic);
  } catch (e) {
    return false;
  }
  return true;
}

export async function createAccountFromMnemonic(name, mnemonic, password) {
  let account;
  try {
    account = getHarmony().wallet.addByMnemonic(mnemonic);
  } catch (e) {
    console.error("createAccountFromMnemonic error = ", e);
    return false;
  }

  let address = getAddress(account.address).bech32;
  const keystore = await encryptPhrase(account.privateKey, password);

  return {
    name,
    address,
    keystore,
  };
}

export function getAddressFromPrivateKey(privateKey) {
  let account = getHarmony().wallet.addByPrivateKey(privateKey);
  let address = getAddress(account.address).bech32;
  return address;
}

export async function getBalance(address, shardId) {
  const hmy = getHarmony();
  hmy.setShardID(shardId);
  let ret = await hmy.blockchain.getBalance({ address });

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

export async function transferOne(
  receiver,
  fromShard,
  toShard,
  amount,
  privateKey,
  gasLimit = "21000",
  gasPrice = 1,
  inputData
) {
  try {
    let harmony = getHarmony();
    const data = !inputData.match(/^0x([a-f0-9])*$/)
      ? stringToHex(inputData)
      : inputData;
    const txn = harmony.transactions.newTx({
      to: receiver,
      value: new harmony.utils.Unit(amount)
        .asEther()
        .toWei()
        .toString(),
      gasLimit,
      shardID:
        typeof fromShard === "string"
          ? Number.parseInt(fromShard, 10)
          : fromShard,
      toShardID:
        typeof toShard === "string" ? Number.parseInt(toShard, 10) : toShard,
      gasPrice: new harmony.utils.Unit(gasPrice)
        .asGwei()
        .toWei()
        .toString(),
      data,
    });
    await getShardInfo();
    const account = harmony.wallet.addByPrivateKey(privateKey);
    const signedTxn = await account.signTransaction(txn);
    const res = await sendTransction(signedTxn);
    return res;
  } catch (err) {
    return {
      result: false,
      mesg: err,
    };
  }
}

export async function sendTransction(signedTxn) {
  try {
    signedTxn
      .observed()
      .on("transactionHash", (txnHash) => {})
      .on("confirmation", (confirmation) => {
        if (confirmation !== "CONFIRMED")
          throw new Error(
            "Transaction confirm failed. Network fee is not enough or something went wrong."
          );
      })
      .on("error", (error) => {
        throw new Error(error);
      });

    const [sentTxn, txnHash] = await signedTxn.sendTransaction();
    const confirmedTxn = await sentTxn.confirm(txnHash);

    var explorerLink;
    if (confirmedTxn.isConfirmed()) {
      explorerLink = getNetworkLink("/tx/" + txnHash);
    } else {
      return {
        result: false,
        mesg: "Can not confirm transaction " + txnHash,
      };
    }

    return {
      result: true,
      mesg: explorerLink,
    };
  } catch (err) {
    return {
      result: false,
      mesg: err,
    };
  }
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
        order,
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
    case "Testnet": {
      basic = "https://explorer.pops.one/#";
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

export function removeDups(myList) {
  let unique = {};
  var newList = [];
  myList.forEach(function(i) {
    if (!unique[i.blockHash]) {
      unique[i.blockHash] = true;
      newList.push(i);
    }
  });

  return newList;
}
