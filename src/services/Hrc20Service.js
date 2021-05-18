import artifact from "./hrc20/artifacts/artifact.json";
import { getHarmony } from "./AccountService";
import BN from "bn.js";
import BigNumber from "bignumber.js";
import { sendTransaction } from "services/AccountService";
import { toBech32, fromBech32 } from "@harmony-js/crypto";

export const oneToHexAddress = (address) => getHarmony().crypto.getAddress(address).basicHex;

export const hexToOneAddress = (address) => getHarmony().crypto.getAddress(address).bech32;

export const getContractInstance = (contractAddress) => {
  const hmy = getHarmony();
  const contract = hmy.contracts.createContract(artifact.abi, contractAddress);
  return contract;
};

export async function getTokenBalance(address, contractAddress) {
  const instance = getContractInstance(contractAddress);
  const hexAddress = oneToHexAddress(address);
  let balance = await instance.methods.balanceOf(hexAddress).call();
  return balance;
}

export async function getTokenDecimals(contractAddress) {
  const instance = getContractInstance(contractAddress);
  let decimals = await instance.methods.decimals().call();
  return new BN(decimals, 16).toNumber();
}

export async function getTokenSymbol(contractAddress) {
  const instance = getContractInstance(contractAddress);
  let symbol = await instance.methods.symbol().call();
  return symbol;
}

export async function sendToken(
  from,
  to,
  amount,
  privateKey,
  gasLimit = "250000",
  gasPrice = 1,
  decimals,
  contractAddress
) {
  try {
    let harmony = getHarmony();
    const instance = getContractInstance(contractAddress);
    const toHex = oneToHexAddress(to);
    const weiAmount = new BN(new BigNumber(amount).multipliedBy(Math.pow(10, decimals)).toFixed(), 10);

    const txn = await instance.methods.transfer(toHex, weiAmount).createTransaction();
    txn.setParams({
      ...txn.txParams,
      from: oneToHexAddress(from),
      gasLimit,
      gasPrice: new harmony.utils.Unit(gasPrice).asGwei().toWei(),
    });
    const account = harmony.wallet.addByPrivateKey(privateKey);
    const signedTxn = await account.signTransaction(txn);
    const res = await sendTransaction(signedTxn);
    return res;
  } catch (err) {
    return {
      result: false,
      mesg: err,
    };
  }
}

export async function decodeInput(to, hexData) {
  try {
    const contract = getContractInstance(fromBech32(to));
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
      amount: new BigNumber(params[1]).dividedBy(Math.pow(10, new BN(decimals, 16).toNumber())).toString(),
      symbol,
    };
  } catch (err) {
    return false;
  }
}
