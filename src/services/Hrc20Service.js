import artifact from "./hrc20/artifacts/artifact.json";
import { getNetworkLink, getHarmony } from "./AccountService";
import BigNumber from "bignumber.js";

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
  return new BigNumber(decimals, 16).toNumber();
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
    let txHash, receipt;
    let harmony = getHarmony();
    const instance = getContractInstance(contractAddress);
    const toHex = oneToHexAddress(to);
    harmony.wallet.addByPrivateKey(privateKey);
    await new Promise(async (resolve, reject) => {
      await instance.methods
        .transfer(
          toHex,
          new BigNumber(amount).multipliedBy(Math.pow(10, decimals)).toString()
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
        .on("confirmation", (confirmation) => {
          if (confirmation !== "CONFIRMED") {
            reject("Gas fee is too low or something is wrong.");
          }
        })
        .on("error", (error) => {
          reject(error);
        });
      resolve("Confirmed");
    });

    return {
      result: true,
      mesg: getNetworkLink("/tx/" + txHash),
    };
  } catch (err) {
    return {
      result: false,
      mesg: err,
    };
  }
}
