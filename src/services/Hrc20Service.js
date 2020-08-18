import artifact from "./hrc20/artifacts/artifact.json";
import { getNetworkLink, getHarmony } from "./AccountService";
import BN from "bn.js";

export const oneToHexAddress = (address) =>
  getHarmony().crypto.getAddress(address).basicHex;

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
  let txHash, receipt, confirmation, error;
  let harmony = getHarmony();
  const instance = getContractInstance(contractAddress);
  const toHex = oneToHexAddress(to);
  harmony.wallet.addByPrivateKey(privateKey);
  await instance.methods
    .transfer(
      toHex,
      new BN(new BN(amount).mul(new BN(10).pow(new BN(decimals))))
    )
    .send({
      from,
      gasLimit,
      gasPrice: new harmony.utils.Unit(gasPrice).asGwei().toWei(),
    })
    .on("transactionHash", (_hash) => {
      txHash = _hash;
    })
    .on("receipt", (_receipt) => {
      receipt = _receipt;
    })
    .on("confirmation", (_confirmation) => {
      confirmation = _confirmation;
    })
    .on("error", (_error) => {
      error = _error;
      console.error(error);
    });
  if (confirmation !== "CONFIRMED") {
    if (confirmation === "PENDING") {
      return {
        result: false,
        mesg: "Can't confirm the transaction. The gas fee is not enough.",
      };
    } else {
      return {
        result: false,
        mesg: "Transaction rejected. TxHash: " + txHash,
      };
    }
  }
  if (error) {
    return {
      result: false,
      mesg: "Failed to send the transaction. Error: " + error,
    };
  }
  return {
    result: true,
    mesg: getNetworkLink("/tx/" + txHash),
  };
}
