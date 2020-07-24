import artifact from "./artifacts/artifact.json";
import { getNetworkLink, getHarmony } from "../txnService";
import BN from "bn.js";

export const oneToHexAddress = (address) =>
  getHarmony().crypto.getAddress(address).basicHex;

export const getContractInstance = (contractAddress) => {
  const hmy = getHarmony();
  hmy.setShardID(0);
  const contract = hmy.contracts.createContract(artifact.abi, contractAddress);
  return contract;
};

export async function getTokenBalance(address, contractAddress) {
  const instance = getContractInstance(contractAddress);
  const hexAddress = oneToHexAddress(address);
  let balance = await instance.methods.balanceOf(hexAddress).call();
  return balance;
}

export async function sendToken(
  from,
  to,
  amount,
  decimals,
  privateKey,
  gasLimit = "250000",
  gasPrice = 1,
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
    });
  if (error) {
    return {
      result: false,
      mesg: "Failed to send transaction",
    };
  }
  if (confirmation !== "CONFIRMED") {
    return {
      result: false,
      mesg: "Can not confirm transaction " + txHash,
    };
  }
  return {
    result: true,
    mesg: getNetworkLink("/tx/" + txHash),
  };
}
