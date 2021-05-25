import { oneToHexAddress } from "services/Hrc20Service";
import { isValidAddress } from "@harmony-js/utils";
const Web3 = require("web3");
const ENS = require("@ensdomains/ensjs").default;
const { ChainID } = require("@harmony-js/utils");

export const setupENS = (network) => {
  const ENS_ADDRESS = {
    [ChainID.HmyMainnet]: "0xaE7FFb8E6e38d80e4d032f53FA9A271764C2FDad",
    [ChainID.HmyTestnet]: "0x23ca23b6f2C40BF71fe4Da7C5d6396EE2C018e6A",
  };
  const provider = new Web3.providers.HttpProvider(network.apiUrl);
  const ens = new ENS({ provider, ensAddress: ENS_ADDRESS[network.chainId] });
  return ens;
};

export const ENS_ADDRESS_TYPE = {
  ADDRESS: "ADDRESS",
  NAME: "NAME",
  UNKNOWN: "UNKNOWN",
};

export const getAddressType = (addrOrName) => {
  try {
    const hexaddr = oneToHexAddress(addrOrName);
    if (isValidAddress(hexaddr)) return ENS_ADDRESS_TYPE.ADDRESS;
    return ENS_ADDRESS_TYPE.UNKNOWN;
  } catch (err) {
    return ENS_ADDRESS_TYPE.NAME;
  }
};

export const isNullAddress = (addr) => {
  return oneToHexAddress(addr) === "0x0000000000000000000000000000000000000000";
};
