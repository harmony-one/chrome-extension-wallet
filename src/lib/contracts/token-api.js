import store from "../../popup/store";
import { getNetworkLink, getHarmony } from "../txnService";

export const oneToHexAddress = (address) =>
  getHarmony().crypto.getAddress(address).basicHex;

export const getContractInstance = (artifact) => {
  const hmy = getHarmony();
  //console.log(artifact.contractName, artifact.networks[store.state.network.chainId].address);
  const contract = hmy.contracts.createContract(
    artifact.abi,
    artifact.networks[store.state.network.chainId].address
  );
  return contract;
};

export async function getTokenBalance(address, artifact) {
  console.log("address, artifact", address, artifact);
  const instance = getContractInstance(artifact);
  const hexAddress = oneToHexAddress(address);
  console.log("instance, hexAddress", instance, hexAddress);
  let balance = await instance.methods.balanceOf(hexAddress).call();
  console.log("balance", balance);
  return balance;
}

export async function getDecimals(artifact) {
  const instance = getContractInstance(artifact);

  // hard coded for SEED
  if (artifact.contractName == "SEED") {
    return 0;
  }

  let decimals = await instance.methods.decimals().call();
  return decimals;
}

export async function increaseTotalSupply(amount, artifact) {
  const instance = getContractInstance(artifact);
  let ret = await instance.methods
    .increaseSupply(
      Unit(amount)
        .asEther()
        .toWei()
    )
    .call();
  return ret;
}

export async function sendToken(
  from,
  to,
  amount,
  privateKey,
  gasLimit = "250000",
  gasPrice = 1,
  artifact
) {
  let txHash, receipt, confirmation, error;
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
