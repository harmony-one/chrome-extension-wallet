const H20 = require("./artifacts/h20.json");
const BUSD = require("./artifacts/BUSDImplementation.json");

export const TOKENS = {
  H20: {
    artifacts: H20,
  },
  BUSD: {
    artifacts: BUSD,
  },
};

export const VALIDTOKENS = {
  Mainnet: ["H20"],
  Pangaea: [],
  Testnet: ["BUSD", "H20"],
  Localnet: [],
  OpenStakingNet: [],
  PartnerNet: [],
};
