import { HarmonyAddress } from "@harmony-js/crypto";
const initArray = {
  Mainnet: [
    {
      address: "0x4abd7C503445380dDc3844DcaE1d08dB997C714A",
      name: "Lma-Art",
    },
  ],
  Testnet: [
    {
      address: "0x8bb8231048722f6157e56c6d48ff957a094233ad",
      name: "BeastQuest",
    },
  ],
  Localnet: [],
};

const getHRC20ContractAddressList = (tokens) => {
  const networkList = Object.keys(tokens);
  let addressList = [];
  networkList.forEach((network) => {
    tokens[network].forEach((token) => {
      addressList.push(new HarmonyAddress(token.address).bech32);
    });
  });
  return addressList;
};

export const initHRC721Tokens = (store) => {
  const { initialized } = store.state.hrc20;
  if (initialized) return;
  Object.keys(initArray).forEach((network) => {
    initArray[network].forEach((token) => {
      if (
        getHRC20ContractAddressList(store.state.hrc20.tokens).includes(
          new HarmonyAddress(token.address).bech32
        )
      )
        return;
      store.commit("hrc721/addToken", { ...token, network });
    });
  });
  store.commit("hrc721/setInitalized", true);
};

const config = {};

export default config;
