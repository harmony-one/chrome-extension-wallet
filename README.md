
## Features
- [x] Generate a new wallet.
- [x] View wallet address with the QR code.
- [x] Import wallet from private key, hmy cli store or mnemonic
- [x] Export private key  
- [x] Send & receive ONE tokens.
- [x] View ONE balance .
- [x] View HRC20 token (BUSD, H2O, SEED) balances.
- [x] Transfer HRC20 tokens (BUSD, H2O)
- [x] View recent transfers .
- [x] Switch the network to Mainnet, Pangaea, Testnet or Localnet.
- [x] Ledger Login
- [ ] Ledger transfer
- [ ] SEED token transfer
- [ ] Javascript API for calling onewallet for signing 
- [ ] Support staking.harmony.one 

## Install from release zip

Onewallet is a chrome extension wallet. You can install the chrome extension manually following the instructions [here](https://www.cnet.com/how-to/how-to-install-chrome-extensions-manually/). 

| Version        | Link | Note | 
| -------------- | ------------- | ------------- |
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

## Create and Use the Smart Contract with the Extension

* Install the latest `@harmony-js/core` npm
```
npm install @harmony-js/core@next
```
* import the harmony extension package
```
const { HarmonyExtension } = require('@harmony-js/core');
```
* Wait until the harmony-one wallet is injected and init the `HarmonyExtension` class with the injected object
```
const harmonyExt = await new HarmonyExtension(window.onewallet);
```
* You can create the smart contract with `harmonyExt` object
```
const instance = harmonyExt.contracts.createContract(abi, address);
```
* You can call the smart contract methods with the `instance`
```
await instance.methods.enter().send({
      value: new hmy.utils.Unit(100).asOne().toWei(),
      gasLimit: '1000001',
      gasPrice: new hmy.utils.Unit('10').asGwei().toWei(),
    });
```

## Use the Harmony Extension Object
* You can use the account of harmony one wallet extension with the following function
```
const account = await harmonyExt.login().then((acc) => {
                    //Todo with the account
                  })
                  .catch((err) => {
                    console.error(err);
                  });
```
* You can also modify the harmony extension object
```
function getExtension(endpoint, shard, chaindID) {
  let ext;
  if (window.onewallet) {
    ext = new HarmonyExtension(window.onewallet);
    // Not mandatory, Harmony-One Wallet extension provides the mainnet to the third-party apps, to customize, you can change manually like below
    ext.setProvider(endpoint);
    ext.setShardID(shard);
    ext.setMessenger(new Messenger(ext.provider, ChainType.Harmony, chaindID));
    ext.contracts.wallet = ext.wallet;
  } else {
    console.error("Could not load harmony extension");
  }
  return ext;
};
```
## How to Sign the transaction with the Harmony Extension object
* Initiate the harmony object
```
const harmony = await new Harmony(rpc_url, {
    chainType: ChainType.Harmony,
    chainId: chain_id
  });
```
### How to Create the transaction manually and sign with the harmony extension
* Sign Normal Transaction for transfer funds
```
const txn = harmony.transactions.newTx({
  from: new HarmonyAddress(from).checksum,
  to: new HarmonyAddress(toAddress).checksum,
  value: Unit.Szabo(amounts[0].amount).toWei(),
  shardID: 0,
  toShardID: 0,
  gasLimit: gasEstimate,
  gasPrice: Unit.One(gasPrice).toHex()
});

signedTxn = await harmonyExt.wallet.signTransaction(txn); //or you can call window.onewallet.signTransaction(txn) directly
const [sentTxn, txnHash] = await signedTxn.sendTransaction();
...
```
* Sign Staking Transaction
```
const stakingTxn = new StakingFactory(harmony.messenger)
  .delegate({
    delegatorAddress: new HarmonyAddress(delegatorAddress).checksum,
    validatorAddress: new HarmonyAddress(validatorAddress).checksum,
    amount: Unit.Szabo(amount).toHex()
  })
  .setTxParams({
    gasPrice: Unit.One(gasPrice).toHex(),
    gasLimit: Unit.Wei(new BN(gasEstimate).add(new BN("20000"))).toHex(),
    chainId: harmony.chainId
  })
  .build()
stakingTxn.setFromAddress(new HarmonyAddress(from).checksum)

signedTxn = await harmonyExt.wallet.signTransaction(txn); //or you can call window.onewallet.signTransaction(txn) directly
const [sentTxn, txnHash] = await signedTxn.sendTransaction();
...
```

## Footnotes
The API interface of Harmony-One Wallet is totally same as the Mathwallet. It's for the people who are already familiar with mathwallet extension. You can just use the `window.onewallet` instead of `window.harmony`. Since this project is open-source, we can update the api interface anytime so if you have a suggestion, feel free to create the issues on the github or contact me directly (derekleesoft@gmail.com). Any Harmonauts' suggestion is welcome.
