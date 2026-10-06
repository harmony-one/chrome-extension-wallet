import React from 'react'
import ReactDOM from 'react-dom'
import { ExtensionPopup } from './components/ExtensionPopup'
import { generateMnemonic, validateMnemonic, importMnemonic } from '../../shared/utils/crypto'
import { IAccount } from '../../shared/types/eth'
import { HarmonyAPI } from '../../shared/utils/harmony-api'
import { HARMONY_CHAIN_ID } from '../../shared/constants/config'

const popupContainer = document.getElementById('popup-container')
if (popupContainer) {
  ReactDOM.render(<ExtensionPopup />, popupContainer)
}

window.addEventListener('message', async (event: MessageEvent) => {
  const { type, payload } = event.data

  switch (type) {
    case 'GENERATE_MNEMONIC': {
      const mnemonic = generateMnemonic()
      window.postMessage({ type: 'MNEMONIC_GENERATED', payload: { mnemonic } }, '*')
      break
    }

    case 'IMPORT_ACCOUNT': {
      const { mnemonic, name, password } = payload
      try {
        const isValid = validateMnemonic(mnemonic)
        if (!isValid) {
          window.postMessage({ type: 'IMPORT_ERROR', payload: { error: 'Invalid mnemonic phrase' } }, '*')
          return
        }

        const accounts = await importMnemonic(mnemonic, name)
        const account = accounts[0]

        const encrypted = await (window as any).chrome?.storage?.local?.get?.(['wallet'])
        const existingWallet = encrypted?.wallet

        const walletData = {
          accounts: [account],
          currentAccount: account.address,
          createdAt: Date.now(),
          updatedAT: Date.now()
        }

        if (window as any).chrome?.storage?.local?.set) {
          ;(window as any).chrome.storage.local.set({ wallet: walletData })
        }

        window.postMessage({ type: 'IMPORT_SUCCESS', payload: { account } }, '*')
      } catch (error: any) {
        window.postMessage({ type: 'IMPORT_ERROR', payload: { error: error.message } }, '*')
      }
      break
    }

    case 'GET_ACCOUNT_INFO': {
      const { address } = payload
      try {
        const accountInfo = await HarmonyAPI.getInstance().getAccountInfo(address)
        window.postMessage({ type: 'ACCOUNT_INFO', payload: { accountInfo } }, '*')
      } catch (error: any) {
        window.postMessage({ type: 'ERROR', payload: { error: error.message } }, '*')
      }
      break
    }

    case 'SEND_TRANSACTION': {
      const { account, to, value, data, gas, gasPrice } = payload
      try {
        const tx = {
          from: account.address,
          to,
          value,
          data: data || '0x',
          gas,
          gasPrice,
          chainId: HARMONY_CHAIN_ID
        }
        const rawTx = await importMnemonic('', '').then(() => '') // placeholder
        window.postMessage({ type: 'TX_HASH', payload: { hash: '0x' } }, '*')
      } catch (error: any) {
        window.postMessage({ type: 'ERROR', payload: { error: error.message } }, '*')
      }
      break
    }

    case 'GET_NETWORK_INFO': {
      try {
        const networkInfo = await HarmonyAPI.getInstance().getNetworkInfo()
        window.postMessage({ type: 'NETWORK_INFO', payload: { networkInfo } }, '*')
      } catch (error: any) {
        window.postMessage({ type: 'ERROR', payload: { error: error.message } }, '*')
      }
      break
    }
  }
})
