import TransportWebUSB from "@ledgerhq/hw-transport-webusb"
import HarmonyApp, { SW_ERR } from "./harmony-ledger"

import { Transaction } from "@harmony-js/transaction"
import { StakingTransaction } from "@harmony-js/staking"

// @ts-ignore
import TransportWebHID from "@ledgerhq/hw-transport-webhid"

const INTERACTION_TIMEOUT = 120 * 1000
var harmonyApp

async function getHarmonyApp() {
  if (harmonyApp) {
    return harmonyApp
  }

  //console.log('harmonyapp=',harmonyApp)

  // check if browser is supported
  getBrowser(navigator.userAgent)

  let transport
  if (isWindows(navigator.platform)) {
    if (!navigator.hid) {
      throw new Error(`BROWSER_HID_DISABLED`)
    }

    try {
      transport = await TransportWebHID.create(INTERACTION_TIMEOUT)
    } catch (err) {
      // throw unknown error
      throw err
    }
  }
  // OSX / Linux
  else {
    try {
      transport = await TransportWebUSB.create(INTERACTION_TIMEOUT)
    } catch (err) {
      /* istanbul ignore next: specific error rewrite */
      if (
        err.message
          .trim()
          .startsWith("No WebUSB interface found for your Ledger device")
      ) {
        throw new Error(
          "Couldn't connect to a Ledger. Please upgrade the Ledger firmware to version 1.5.5 or later."
        )
      }
      /* istanbul ignore next: specific error rewrite */
      if (err.message.trim().startsWith("Unable to claim interface")) {
        // apparently can't use it in several tabs in parallel
        throw new Error(
          "Could not access Ledger device. Is it being used in another tab?"
        )
      }
      /* istanbul ignore next: specific error rewrite */
      if (err.message.trim().startsWith("Not supported")) {
        // apparently can't use it in several tabs in parallel
        throw new Error(
          "Your browser doesn't seem to support WebUSB yet. Try updating it to the latest version."
        )
      }
      /* istanbul ignore next: specific error rewrite */
      if (err.message.trim().startsWith("No device selected")) {
        // apparently can't use it in several tabs in parallel
        throw new Error(
          "You did not select a Ledger device. Check if the Ledger is plugged in and unlocked."
        )
      }

      // throw unknown error
      throw err
    }
  }

  harmonyApp = new HarmonyApp(transport)
  return harmonyApp
}

export async function connectLedgerApp() {
  const app = await getHarmonyApp()
  let response = await app.publicKey(true)

  if (response.return_code === SW_ERR) {
    throw new Error("Authorization request rejected")
  }

  if (!response.one_address) {
    throw new Error("Address Not Found")
  }

  if (response.one_address.indexOf(`1`) === -1) {
    throw new Error("Not A Valid Bech32 Address")
  }

  return response.one_address.toString()
}

export async function showLedgerAddress() {
  const app = await getHarmonyApp()
  let response  = await app.publicKey(false)

  if (response.return_code === SW_ERR) {
    throw new Error("Address Rejected")
  }

  if (!response.one_address) {
    throw new Error("Address Not Found")
  }

  if (response.one_address.indexOf(`1`) === -1) {
    throw new Error("Not A Valid Bech32 Address")
  }

  return response.one_address.toString()
}

function isWindows(platform) {
  return platform.indexOf("Win") > -1
}

function getBrowser(userAgent) {
  const ua = userAgent.toLowerCase()
  const isChrome = /chrome|crios/.test(ua) && !/edge|opr\//.test(ua)

  if (!isChrome) {
    throw new Error("Your browser doesn't support Ledger devices.")
  }

  if (isChrome) return '"chrome"'
}
