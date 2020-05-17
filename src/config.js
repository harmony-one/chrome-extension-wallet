const { ChainID, ChainType } = require("@harmony-js/utils");

export default {
  networks: [
    {
      id: 1,
      chainId: ChainID.HmyMainnet,
      name: "Mainnet",
      apiUrl: "https://api.s0.t.hmny.io",
      type: ChainType.Harmony,
    },
    {
      id: 2,
      chainId: ChainID.HmyPangaea,
      name: "Pangaea",
      apiUrl: "https://api.s0.pga.hmny.io",
      type: ChainType.Harmony,
    },
    {
      id: 3,
      chainId: ChainID.HmyTestnet,
      name: "Testnet",
      apiUrl: "https://api.s0.b.hmny.io",
      type: ChainType.Harmony,
    },
    {
      id: 4,
      chainId: ChainID.HmyLocal,
      name: "Localnet",
      apiUrl: "http://127.0.0.1:9500",
      type: ChainType.Harmony,
    },
    {
      id: 5,
      chainId: ChainID.HmyPangaea,
      name: "OpensSakingNet",
      apiUrl: "https://api.s0.os.hmny.io",
      type: ChainType.Harmony,
    },
      {
          id: 6,
          chainId: 4,
          name: "PartnerNet",
          apiUrl: "https://api.s0.ps.hmny.io",
          type: ChainType.Harmony,
      },
  ],
};
