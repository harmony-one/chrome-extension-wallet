import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import HarmonyApp, { SW_ERR } from "./ledger/LedgerSDK";
import { getHarmony } from "./AccountService";
import { getContractInstance, oneToHexAddress } from "./Hrc20Service";
import store from "../popup/store";
import { LEDGER_LOCKED } from "../types";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import { stringToHex } from "./CryptoService";
import BigNumber from "bignumber.js";

const INTERACTION_TIMEOUT = 120 * 1000;
var harmonyApp;

async function getHarmonyApp() {
  if (harmonyApp) {
    return harmonyApp;
  }

  // check if browser is supported
  getBrowser(navigator.userAgent);

  let transport;
  if (isWindows(navigator.platform)) {
    if (!navigator.hid) {
      throw new Error("HID is disabled in this browser");
    }

    try {
      transport = await TransportWebHID.create(INTERACTION_TIMEOUT);
    } catch (err) {
      // throw unknown error
      throw err;
    }
  }
  // OSX / Linux
  else {
    try {
      transport = await TransportWebUSB.create(INTERACTION_TIMEOUT);
    } catch (err) {
      /* istanbul ignore next: specific error rewrite */
      if (
        err.message
          .trim()
          .startsWith("No WebUSB interface found for your Ledger device")
      ) {
        throw new Error(
          "Couldn't connect to a Ledger. Please upgrade the Ledger firmware to version 1.5.5 or later."
        );
      }
      /* istanbul ignore next: specific error rewrite */
      if (err.message.trim().startsWith("Unable to claim interface")) {
        // apparently can't use it in several tabs in parallel
        throw new Error(
          "Could not access Ledger device. Is it being used in another tab?"
        );
      }
      /* istanbul ignore next: specific error rewrite */
      if (err.message.trim().startsWith("Not supported")) {
        // apparently can't use it in several tabs in parallel
        throw new Error(
          "Your browser doesn't seem to support WebUSB yet. Try updating it to the latest version."
        );
      }
      /* istanbul ignore next: specific error rewrite */
      if (err.message.trim().startsWith("No device selected")) {
        // apparently can't use it in several tabs in parallel
        throw new Error(
          "You did not select a Ledger device. Check if the Ledger is plugged in and unlocked."
        );
      }

      // throw unknown error
      throw err;
    }
  }

  harmonyApp = new HarmonyApp(transport);
  return harmonyApp;
}

export async function connectLedgerApp() {
  const app = await getHarmonyApp();
  let response = await app.publicKey(true);

  if (response.return_code === SW_ERR) {
    throw new Error(LEDGER_LOCKED);
  }

  if (!response.one_address) {
    throw new Error("Address Not Found");
  }

  if (response.one_address.indexOf(`1`) === -1) {
    throw new Error("Not A Valid Bech32 Address");
  }

  return response.one_address.toString();
}
export async function isLedgerLocked() {
  const app = await getHarmonyApp();
  let response = await app.publicKey(true);
  if (response.return_code === SW_ERR) return true;
  return false;
}
/*
export async function showLedgerAddress() {
  const app = await getHarmonyApp();
  let response = await app.publicKey(false);

  if (response.return_code === SW_ERR) {
    throw new Error("Address Rejected");
  }

  if (!response.one_address) {
    throw new Error("Address Not Found");
  }

  if (response.one_address.indexOf(`1`) === -1) {
    throw new Error("Not A Valid Bech32 Address");
  }

  return response.one_address.toString();
}
*/
function isWindows(platform) {
  return platform.indexOf("Win") > -1;
}

function getBrowser(userAgent) {
  const ua = userAgent.toLowerCase();
  const isChrome = /chrome|crios/.test(ua) && !/edge|opr\//.test(ua);

  if (!isChrome) {
    throw new Error("Your browser doesn't support Ledger devices.");
  }

  if (isChrome) return "chrome";
}
export async function signHRCTransactionWithLedger(
  from,
  to,
  amount,
  gasLimit = "250000",
  gasPrice = 1,
  decimals,
  contract
) {
  try {
    const harmony = getHarmony();
    const instance = getContractInstance(contract);
    const toHex = oneToHexAddress(to);
    const app = await getHarmonyApp();

    const txn = await instance.methods
      .transfer(
        toHex,
        new BigNumber(amount).multipliedBy(Math.pow(10, decimals)).toString()
      )
      .createTransaction();
    txn.setParams({
      ...txn.txParams,
      from: oneToHexAddress(from),
      gasLimit,
      gasPrice: new harmony.utils.Unit(gasPrice).asGwei().toWei(),
    });

    const signedTxn = await app.signTransaction(
      txn,
      store.state.network.chainId,
      0,
      harmony.messenger
    );
    return {
      success: true,
      result: signedTxn,
    };
  } catch (err) {
    return {
      success: false,
      result: err,
    };
  }
}
export async function signTransactionWithLedger(
  receiver,
  fromShard,
  toShard,
  amount,
  gasLimit = "21000",
  gasPrice = 1,
  inputData
) {
  try {
    const harmony = getHarmony();
    const data = !inputData.match(/^0x([a-f0-9])*$/)
      ? stringToHex(inputData)
      : inputData;
    const app = await getHarmonyApp();
    const txn = harmony.transactions.newTx({
      to: receiver,
      value: new harmony.utils.Unit(amount)
        .asEther()
        .toWei()
        .toString(),
      gasLimit: gasLimit,
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
    const signedTxn = await app.signTransaction(
      txn,
      store.state.network.chainId,
      fromShard,
      harmony.messenger
    );
    return {
      success: true,
      result: signedTxn,
    };
  } catch (err) {
    return {
      success: false,
      result: err,
    };
  }
}
