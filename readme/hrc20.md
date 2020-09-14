# HRC20 Documentation

## Table of Contents

- [Display the HRC20 token symbol and balance](#display-the-hrc20-token-symbol-and-balance)
  - [Get the HRC20 token Symbol](#get-the-hrc20-token-symbol)
  - [Display the HRC20 token balance](#display-the-hrc20-token-balance)
- [Send the HRC20 token](#send-the-hrc20-token)
- [Read the HRC20 token transfer amount in the harmony network](#read-the-hrc20-token-transfer-amount-in-the-harmony-network)

---

## Display the HRC20 token symbol and balance

1. Create the `Harmony` Object

```javascript
    const harmony = new Harmony(
      // rpc url
      rpc, //mainnet: "https://api.s0.t.hmny.io", testnet: "https://api.s0.b.hmny.io"
      {
        chainType, //ChainType.Harmony
        chainId: //ChainID.HmyMainnet, ChainID.HmyTestnet or ChainID.HmyLocal
      }
    );
```

2. Create the hrc20 contract instance

- Create the hrc20 contract with [abi](https://github.com/harmony-one/onewallet/blob/master/src/services/hrc20/artifacts/artifact.json) and contract address

```javascript
const instance = harmony.contracts.createContract(abi, contractAddress);
```

3. Call the `symbol` and `balanceOf` function in the hrc20 smart contract to display the hrc20 token symbol and balance.

There are 9 smart contract functions in the HRC20 Contract.

- approve
- transferFrom
- transfer
- name
- totalSupply
- decimals
- balanceOf
- symbol
- allowance

We need only `symbol`, `balanceOf`, `decimals`, `transfer` functions for hrc20 wallet.

### Get the hrc20 token symbol

```javascript
await instance.methods.symbol().call();
```

### Display the hrc20 token balance

- You need to convert the \$ONE address to the hex address

```javascript
const hexAddress = harmony.crypto.getAddress(address).basicHex; //address is $ONE address, if it is hex already, you don't have to call this function
let weiBalance = await instance.methods.balanceOf(hexAddress).call();
```

- `balance` object is a big number so you have to divide by Math.pow(10, `decimals`) to get the correct balance. You can use [BigNumber.js](https://github.com/MikeMcl/bignumber.js)

First, get the token decimals. Here, hrc20 smart contract returns the decimals as a hex value so you have to convert it to decimal. You can use [BN.js](https://github.com/indutny/bn.js)

```javascript
const hexDecimals = await instance.methods.decimals().call();
const decimals = new BN(hexDecimals, 16).toNumber();
```

Second, get the correct balance using the BigNumber.js

```javascript
let balance = BigNumber(weiBalance)
  .dividedBy(Math.pow(10, decimals))
  .toFixed();
```

---

## Send the HRC20 token

1. Convert the amount to wei amount and sign the transaction

```javascript
harmony.wallet.addByPrivateKey(privateKey); //privateKey is your wallet's privatekey
const weiAmount = new BN(
  new BigNumber(amount).multipliedBy(Math.pow(10, decimals)).toFixed(),
  10
);
```

2. Call the `transfer` function to send the hrc20 tokens

```javascript
await instance.methods
  .transfer(toHex, weiAmount)
  .send({
    from,
    gasLimit, //default gaslimit for Hrc20 transaction is 250000
    gasPrice: new harmony.utils.Unit(gasPrice).asGwei().toWei(),
  })
  .on("transactionHash", (_hash) => {
    //_hash: transaction hash
  })
  .on("receipt", (_receipt) => {
    //_receipt: transaction receipt
  })
  .on("confirmation", (confirmation) => {
    if (confirmation !== "CONFIRMED") {
      reject("Gas fee is too low or something is wrong."); //transaction failed
    }
  })
  .on("error", (error) => {
    reject(error); //transaction failed
  });
```

---

## Read the HRC20 token transfer amount in the harmony network

1. Call the rpc api [hmy_getTransactionsHistory](https://docs.harmony.one/home/developers/api/methods/transaction-related-methods/hmy_gettransactionshistory) to read the transaction history. You can see the sample response of the api in the [docs.harmony.one](https://docs.harmony.one/home/developers/api/methods/transaction-related-methods/hmy_gettransactionshistoryharmony)

```javascript
const ret = await harmony.messenger.send(
  "hmy_getTransactionsHistory",
  [
    {
      address, //your wallet's address
      pageIndex, //e.g, 0
      pageSize, //e.g, 100
      fullTx: true,
      txType: "ALL",
      order, //e.g, "DESC"
    },
  ],
  harmony.messenger.chainPrefix,
  harmony.messenger.getCurrentShardID()
);
return ret.result; //transaction list
```

2. Decode the transaction data and display the amount

- Read the smart contract from `to` address

```javascript
import { fromBech32 } from "@harmony-js/crypto";

const instance = harmony.contracts.createContract(abi, to); //to address of transaction
```

- Decode the transaction data

```javascript
export async function decodeInput(contract, hexData) {
  try {
    let decodeParameters = (inputs, data) => {
      if (0 == inputs.length) return [];
      let params = contract.abiCoder.decodeParameters(inputs, data);
      params.length = inputs.length;
      return Array.from(params);
    };

    const no0x = hexData.startsWith("0x") ? hexData.slice(2) : hexData;
    const sig = no0x.slice(0, 8).toLowerCase();
    const method = contract.abiModel.getMethod("0x" + sig);
    if (!method) return false;

    const params = decodeParameters(method.inputs, "0x" + no0x.slice(8));
    const decimals = await contract.methods.decimals().call();
    const symbol = await contract.methods.symbol().call();
    return {
      to: toBech32(params[0]),
      amount: new BigNumber(params[1])
        .dividedBy(Math.pow(10, new BN(decimals, 16).toNumber()))
        .toString(),
      symbol,
    };
  } catch (err) {
    return false;
  }
}
```

```javascript
const params = await decodeInput(
  instance,
  txn.input //txn.input is data of transaction
);
```

`decodeInput` function returns `to`, `amount` //weiAmount, and `symbol` if it is a hrc20 transaction, otherwise it returns `false`.

You can display the transaction history with these values.
