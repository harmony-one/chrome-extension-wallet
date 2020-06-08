import store from "../../popup/store";

import { Harmony } from "@harmony-js/core";
import BigNumber from "bignumber.js";

var currentNetwork = "";

var harmony = new Harmony(
  // rpc url
  store.state.network.apiUrl,
  {
    chainType: store.state.network.type,
    chainId: store.state.network.chainId,
  }
);

export const oneToHexAddress = (address) =>
  getHarmony().crypto.getAddress(address).basicHex;

export default function getHarmony() {
  if (currentNetwork != store.state.network.name) {
    currentNetwork = store.state.network.name;
    console.log("current network changed to", currentNetwork);
    harmony = new Harmony(
      // rpc url
      store.state.network.apiUrl,
      {
        chainType: store.state.network.type, //ChainType.Harmony,
        chainId: store.state.network.chainId, //ChainID.HmyMainnet,
      }
    );
  }

  return harmony;
}

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
  return BigNumber(balance);
}

export async function sendToken(
  from,
  to,
  amount,
  gasLimit = "21000",
  gasPrice = 1,
  artifact
) {
  const instance = getContractInstance(artifact);
  console.log("from Address", from);
  console.log("to Address", to);
  console.log("amount", amount);
  const toHex = oneToHexAddress(to);
  const fromHex = oneToHexAddress(from);
  const tx = instance.methods.transfer(toHex, 10000); //10000 is a place holder

  getHarmony().wallet.setSigner(from);
  const sendTxn = tx //send transaction not working
    .send({
      from: fromHex,
      gasLimit,
      gasPrice: new harmony.utils.Unit(gasPrice)
        .asGwei()
        .toWei()
        .toString(),
    })
    .on("transactionHash", (_hash) => {
      console.log(_hash);
    })
    .on("receipt", (_receipt) => {
      console.log(_receipt);
    })
    .on("confirmation", (confirmationNumber, receipt) => {
      console.log(confirmationNumber);
      console.log(receipt);
    })
    .on("error", (_error) => {
      return {
        result: false,
        mesg: _error,
      };
    });
  return {
    result: true,
    mesg: "Token Transfer Success",
  };
}
