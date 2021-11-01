import { HarmonyAddress } from "@harmony-js/crypto";
const initArray = {
  Mainnet: [
    {
      address: "0x4abd7C503445380dDc3844DcaE1d08dB997C714A",
      name: "Lma-Art",
    },
    {
      address: "0x560cE20C7a7E510b38CfaAd560aF1a4f03C5aEe9",
      name: "Dat Penguin Club"
    }
  ],
  Testnet: [
    {
      address: "0x8bb8231048722f6157e56c6d48ff957a094233ad",
      name: "BeastQuest",
    },
    {
      address: "0x3578f29a70F28ABCc90Cc31645823d0A68F704e7",
      name: "Dat Penguin Club"
    }
  ],
  Localnet: [],
};

const getHRC721ContractAddressList = (tokens) => {
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
  const { initialized } = store.state.hrc721;
  if (initialized) return;
  Object.keys(initArray).forEach((network) => {
    initArray[network].forEach((token) => {
      if (
        getHRC721ContractAddressList(store.state.hrc721.tokens).includes(
          new HarmonyAddress(token.address).bech32
        )
      )
        return;
      store.commit("hrc721/addToken", { ...token, network });
    });
  });
  store.commit("hrc721/setInitalized", true);
};
