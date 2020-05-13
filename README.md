
## Features
* Generate a new wallet.
* Import wallet from private key, hmy cli store or mnemonic
* Export private key (for dev mode only)
* View ONE balance .
* View all HRC20 token balances.
* View wallet address with the QR code.
* View recent transfers .
* Send & receive ONE and other HRC tokens.
* Switch the network to Mainnet or Testnet.
 
## Build Extension

* Install [node.js](https://nodejs.org/) and npm.
* Install dependencies :
  ```
  npm install
  ```
* Build the project :
  ```
  npm run build
  ```
* Uncompressed build can be found in `/dist` folder, compressed build is `tronmask.zip`.
* Go to Chrome Extensions page and activate the Developer Mode.
* Click `Load Unpacked` button and point it to `/dist` folder.

## Development
* Install [node.js](https://nodejs.org/) and npm.
* Install dependencies :
  ```
  npm install
  ```
* Run the project :
  ```
  npm run dev
  ```
* Go to Chrome Extensions page and activate the Developer Mode.
* Click `Load Unpacked` button and point it to `/dist` folder, the extension will be autoreloading as you change the codes.
