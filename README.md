
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
- [ ] Support the ledger wallet to communicate between onewallet and staking.harmony.one
- [ ] Add/Delete/Edit the contacts
- [ ] Revoke the accounts connected to the third-party website
- [ ] View the USD balance on the main page
- [ ] View the recent transaction history on the home page
- [ ] Update the expand view page of the create/import/connect the hardware wallet

## Development 

* Install [node.js](https://nodejs.org/) and npm
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
* You can sign out from the harmony extension if you want to switch the account
```
await harmonyExt.logout(); //or await window.onewallet.forgetIdentity();
```
* You can also customize the harmony extension object
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
The API interface of the One Wallet is the same as that of Mathwallet. You may use `window.onewallet` instead of `window.harmony`. This project is open-source, and we can improve the API interface based on community support; feel free to add suggestions as issues on the Github.
