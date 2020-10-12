## Features

- [x] Create/Import the wallet with Mnemonic, Private Key and Harmony keystore
- [x] Deposit with the QR code.
- [x] Switch the network to Mainnet, Testnet or Localnet.
- [x] Send & receive ONE tokens (support the ledger wallet).
- [x] Send & receive HRC20 tokens (support the ledger wallet).
- [x] Add/Edit/Delete HRC20 tokens
- [x] Export private key
- [x] View transaction history .
- [x] Provide the api for signing the transaction
- [x] Support staking.harmony.one
- [x] Lock the wallet with the 4/6 digits PIN Code
- [x] Auto lock the wallet after timeout
- [x] Set the pin code, pin digits and lock timer on the settings
- [x] Support the ledger wallet to communicate between onewallet and staking.harmony.one
- [x] View the HRC20 token transaction amount in the history page
- [x] Add/Delete/Edit the contacts
- [ ] View and revoke the accounts connected to the third-party website
- [x] View the USD balance on the main page

## Development

- Install [node.js](https://nodejs.org/) and npm
- Install dependencies :
  ```
  npm install
  ```
- Run the project :
  ```
  npm run dev
  ```
- Go to Chrome Extensions page and activate the Developer Mode.
- Click `Load Unpacked` button and point it to `/dist` folder, the extension will be autoreloading as you change the codes.

## Build Extension

- Install [node.js](https://nodejs.org/) and npm.
- Install dependencies :
  ```
  npm install
  ```
- Build the project :
  ```
  npm run build
  ```
- Uncompressed build can be found in `/dist` folder, compressed build is `onewallet.zip`.
- Go to Chrome Extensions page and activate the Developer Mode.
- Click `Load Unpacked` button and point it to `/dist` folder.

---

## Documentation

- [Onewallet API documentation](/readme/api.md)
- [HRC20 documentation](/readme/hrc20.md)
