# Onewallet API Documentation

## Table of Contents

- [Create and Use the Smart Contract with the Extension](#create-and-use-the-smart-contract-with-the-extension)
- [Use the Harmony Extension Object](#use-the-harmony-extension-object)
- [How to Sign the transaction with the Harmony Extension object](#how-to-sign-the-transaction-with-the-harmony-extension-object)
- [Footnotes](#footnotes)

---

## Create and Use the Smart Contract with the Extension

- Install the latest `@harmony-js/core` npm

```
npm install @harmony-js/core@next
```

- import the harmony extension package

```
const { HarmonyExtension } = require('@harmony-js/core');
```

- Wait until the harmony-one wallet is injected and init the `HarmonyExtension` class with the injected object

```
const harmonyExt = await new HarmonyExtension(window.onewallet);
```

- You can create the smart contract with `harmonyExt` object

```
const instance = harmonyExt.contracts.createContract(abi, address);
```

- You can call the smart contract methods with the `instance`

```
await instance.methods.enter().send({
      value: new hmy.utils.Unit(100).asOne().toWei(),
      gasLimit: '1000001',
      gasPrice: new hmy.utils.Unit('10').asGwei().toWei(),
    });
```

## Use the Harmony Extension Object

- You can use the account of harmony one wallet extension with the following function

```
const account = await harmonyExt.login().then((acc) => {
                    //Todo with the account
                  })
                  .catch((err) => {
                    console.error(err);
                  });
```

- You can sign out from the harmony extension if you want to switch the account

```
await harmonyExt.logout(); //or await window.onewallet.forgetIdentity();
```

- You can also customize the harmony extension object

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

- Initiate the harmony object

```
const harmony = await new Harmony(rpc_url, {
    chainType: ChainType.Harmony,
    chainId: chain_id
  });
```

### How to Create the transaction manually and sign with the harmony extension

- Sign Normal Transaction for transfer funds

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

- Sign Staking Transaction

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
