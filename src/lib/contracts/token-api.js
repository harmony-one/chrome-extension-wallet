import store from "../../popup/store";
import { getNetworkLink, getHarmony } from "../txnService";

export const oneToHexAddress = (address) =>
  getHarmony().crypto.getAddress(address).basicHex;

export const getContractInstance = (artifact) => {
  const hmy = getHarmony();
  const contract = hmy.contracts.createContract(
    artifact.abi,
    artifact.networks[store.state.network.chainId].address
  );
  return contract;
};

export async function getTokenBalance(address, artifact) {
  const instance = getContractInstance(artifact);
  const hexAddress = oneToHexAddress(address);
  let balance = await instance.methods.balanceOf(hexAddress).call();
  return balance;
}

export async function sendToken(
  from,
  to,
  amount,
  privateKey,
  gasLimit = "6721900",
  gasPrice = 1,
  artifact
) {
  let txHash, receipt;
  let harmony = getHarmony();
  const instance = getContractInstance(artifact);
  const toHex = oneToHexAddress(to);
  harmony.wallet.addByPrivateKey(privateKey);
  await instance.methods
    .transfer(toHex, new harmony.utils.Unit(amount).asEther().toWei())
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
      if (_confirmation === "REJECTED") {
        return {
          result: false,
          mesg: "Can not confirm transaction " + txHash,
        };
      }
    })
    .on("error", (_error) => {
      return {
        result: false,
        mesg: "Failed to send transaction",
      };
    });

  return {
    result: true,
    mesg: getNetworkLink("/tx/" + txHash),
  };
}
