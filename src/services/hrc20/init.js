import { HarmonyAddress } from "@harmony-js/crypto";
const initArray = {
  Mainnet: [
    // {
    //   symbol: "SEED",
    //   address: "0x793DAC3Ec4969A5BEE684BcF4290d52feB8F51b4",
    //   decimals: 6,
    //   balance: 0,
    // },
    {
      symbol: "BUSD",
      address: "one1u9mwheravgdesjnnqd4emfwcx3q3aae5hw36l2",
      decimals: 18,
      balance: 0,
    },
    {
      symbol: "LINK",
      address: "one1yxzn9gf28zdy4yhup30my2gp68qerx929rv2ns",
      decimals: 18,
      balance: 0,
    },
  ],
  Testnet: [
    {
      symbol: "BUSD",
      address: "0xc4860463c59d59a9afac9fde35dff9da363e8425",
      decimals: 18,
      balance: 0,
    },
    {
      symbol: "LINK",
      address: "0xac8bd2b27d45d582a3882e33f626f4e3d3f49c92",
      decimals: 18,
      balance: 0,
    },
  ],
  Localnet: [],
};

const getContractAddressList = (tokens) => {
  const networkList = Object.keys(tokens);
  let addressList = [];
  networkList.forEach((network) => {
    tokens[network].forEach((token) => {
      addressList.push(new HarmonyAddress(token.address).bech32);
    });
  });
  return addressList;
};

export const initHRC20Tokens = (store) => {
  const { initialized } = store.state.hrc20;
  if (initialized) return;
  Object.keys(initArray).forEach((network) => {
    initArray[network].forEach((token) => {
      if (
        getContractAddressList(store.state.hrc20.tokens).includes(
          new HarmonyAddress(token.address).bech32
        )
      )
        return;
      store.commit("hrc20/addToken", { ...token, network });
    });
  });
  store.commit("hrc20/setInitalized", true);
};
