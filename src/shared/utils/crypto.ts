import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import { ecsign, pubToAddress, toChecksumAddress } from 'ethereumjs-util'
import * as hdkey from 'hdkey'
import { HARMONY_CHAIN_ID, ONE_DERIVATION_PATH } from '../constants/config'
import { IAccount } from '../types/eth'
import { HarmonyAPI } from './harmony-api'

export const derivePathFromHex = (path: string): number[] => {
  return path
    .split('/')
    .filter(segment => segment !== 'm' && segment !== '')
    .map(segment => {
      const isHardened = segment.includes("'")
      const index = parseInt(segment.replace("'", ''), 10)
      return isHardened ? index + 0x80000000 : index
    })
}

export const getAddressFromMnemonic = (mnemonic: string, index: number = 0): string => {
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = bip32.fromSeed(seed)
  const child = root.derivePath(`m/44'/1023'/0'/0/${index}`)
  const pubkey = child.publicKey
  const address = pubToAddress(pubkey, true)
  return toChecksumAddress(`0x${address.toString('hex')}`)
}

export const generateMnemonic = (): string => {
  return bip39.generateMnemonic()
}

export const validateMnemonic = (mnemonic: string): boolean => {
  return bip39.validateMnemonic(mnemonic)
}

export const getPrivateKeyFromMnemonic = (
  mnemonic: string,
  index: number = 0
): string => {
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = hdkey.fromMasterSeed(seed)
  const child = root.derive(`m/44'/1023'/0'/0/${index}`)
  return `0x${child.privateKey.toString('hex')}`
}

/**
 * Derives an account from a mnemonic using a specific BIP derivation path.
 */
const deriveAccount = (mnemonic: string, derivationPath: string, index: number = 0): IAccount => {
  const fullpath = `${derivationPath}/${index}`
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = bip32.fromSeed(seed)
  const child = root.derivePath(fullpath)
  const pubkey = child.publicKey
  const address = pubToAddress(pubkey, true)
  const checksumAddress = toChecksumAddress(`0x${address.toString('hex')}`)
  const privateKey = `0x${child.privateKey.toString('hex')}`
  return { address: checksumAddress, privateKey }
}

/**
 * Import mnemonic and try multiple BIP derivation paths (BIP-44, BIP-49, BIP-84).
 * Returns the first account that has a non-zero balance on-chain.
 * Falls back to BIP-44 if no balance is found on any path.
 */
export const importMnemonic = async (
  mnemonic: string,
  name: string
): Promise<IAccount[]> => {
  const derivationPaths = [
    "m/44'/1023'/0'/0/0",  // BIP-44 (standard)
    "m/49'/1023'/0'/0/0",  // BIP-49 (legacy nested SegWit)
    "m/84'/1023'/0'/0/0",  // BIP-84 (native SegWit)
  ]

  const accounts: IAccount[] = []

  for (const path of derivationPaths) {
    const account = deriveAccount(mnemonic, path)
    accounts.push(account)
  }

  // Check on-chain balance for each derived account
  let balancedAccount: IAccount | null = null
  for (const account of accounts) {
    try {
      const response = await HarmonyAPI.getInstance().getAccountInfo(account.address)
      if (response && response.balance && parseInt(response.balance) > 0) {
        balancedAccount = account
        break
      }
    } catch {
      continue
    }
  }

  // If we found an account with balance, return just that one (with name)
  if (balancedAccount) {
    return [{ ...balancedAccount, name }]
  }

  // Fallback: return the first account (BIP-44) if none have balance
  return [{ ...accounts[0], name }]
}

export const signTransaction = async (
  transaction: object,
  privateKey: string
): Promise<string> => {
  const tx = new HarmonyAPI.getInstance().Transaction(transaction)
  tx.sign(Buffer.from(privateKey.replace('0x', ''), 'hex'))
  const serializeTx = tx.serialize()
  const raw = '0x' + Buffer.from(serializeTx).toString('hex')
  return raw
}

export const signMessage = async (message: string, privateKey: string) => {
  const messageBuffer = Buffer.from(message, 'utf8')
  const signature = ecsign(messageBuffer, Buffer.from(privateKey.slice(2), 'hex'))
  return Buffer.from(signature.v).toString('hex') +
    signature.r.toString('hex') +
    signature.s.toString('hex')
}

export const encryptWalletWithPassword = async (
  privateKey: string,
  password: string
): Promise<{ crypto: object; mnemonic: string }> => {
  const derivedKey = await crypto.subtle.importKey('raw',
    Buffer.from(password, 'utf8'), 'PBKDF2', false, ['deriveKey']
  )
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const keyBuffer = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    derivedKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  )

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyBuffer,
    Buffer.from(privateKey, 'utf8')
  )

  const cryptoObj = {
    cipher: 'aes-256-ctr',
    ciphertext: Buffer.from(encrypted).toString('hex'),
    cipherparams: { iv: Buffer.from(iv).toString('hex') },
    kdf: 'pbkdf2',
    kdfparams: { c: 100000, dklen: 32, prf: 'hmac-sha256', salt: Buffer.from(salt).toString('hex') },
    mac: 'hex'
  }

  return { crypto: cryptoObj, mnemonic: '' }
}

export const decryptWalletWithPassword = async (
  crypto: object,
  password: string
): Promise<string> => {
  const cryptoObj = crypto as any
  const derivedKey = await crypto.subtle.importKey('raw',
    Buffer.from(password, 'utf8'), 'PBKDF2', false, ['deriveKey']
  )
  const salt = Buffer.from(cryptoObj.kdfparams.salt, 'hex')
  const iv = Buffer.from(cryptoObj.cipherparams.iv, 'hex')

  const keyBuffer = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: cryptoObj.kdfparams.c, hash: 'SHA-256' },
    derivedKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  )

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    keyBuffer,
    Buffer.from(cryptoObj.ciphertext, 'hex')
  )

  return Buffer.from(decrypted).toString('utf8')
}
