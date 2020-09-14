# HRC20 Documentation

## Table of Contents

- [Display the HRC20 token symbol and balance](#display-the-hrc20-token-symbol-and-balance)
  - [Get the HRC20 token Symbol](get-the-hrc20-token-symbol)
  - [Display the HRC20 token balance](display-the-hrc20-token-balance)
- [Send the HRC20 token](#send-the-hrc20-token)
- [Read the HRC20 token transfer amount in the harmony network](read-the-hrc20-token-transfer-amount-in-the-harmony-network)

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

Call the `transfer` function to send the hrc20 tokens

1.
