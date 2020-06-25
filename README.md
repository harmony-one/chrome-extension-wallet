
## Features
- [x] Generate a new wallet.
- [x] View wallet address with the QR code.
- [x] Import wallet from private key, hmy cli store or mnemonic
- [x] Export private key  
- [x] Send & receive ONE tokens.
- [x] View ONE balance .
- [x] View HRC20 token (BUSD, H2O) balances.
- [x] Transfer HRC20 tokens (BUSD, H2O)
- [x] View recent transfers .
- [x] Switch the network to Mainnet, Pangaea, Testnet or Localnet.
- [x] Ledger Login
- [ ] Ledger transfer

## Install from release zip

Onewallet is a chrome extension wallet. You can install the chrome extension manually following the instructions [here](https://www.cnet.com/how-to/how-to-install-chrome-extensions-manually/). 

| Version        | Link | Note | 
| -------------- | ------------- |
| Version 0.1 | [Alpha Release Candidate 0.1 ](https://github.com/harmony-one/onewallet/raw/master/release/onewallet_alpha0.1.zip)| HRC20 token H2O/BUSD | 
| Version 0.2 | [Alpha Release Candidate 0.2 ](https://github.com/harmony-one/onewallet/raw/master/release/onewallet_alpha0.2.zip)| HRC20 token SEED |

## Development 

* Install [node.js](https://nodejs.org/) and npm (I used node.js version v10.17.0 on my Mac)
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
* Uncompressed build can be found in `/dist` folder, compressed build is `onewallet.zip`.
* Go to Chrome Extensions page and activate the Developer Mode.
* Click `Load Unpacked` button and point it to `/dist` folder.

