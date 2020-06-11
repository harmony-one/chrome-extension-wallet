const H20 = require("./artifacts/h20.json");
const USDC = require("./artifacts/usdc.json");
const BUSD = require("./artifacts/BUSDImplementation.json");

export const TOKENS = {
  H20: {
    artifacts: H20,
  },
  USDC: {
    artifacts: USDC,
  },
  BUSD: {
    artifacts: BUSD,
  },
};

export const VALIDTOKENS = {
  Mainnet: ["H20"],
  Pangaea: [],
  Testnet: ["H20","BUSD"],
  Localnet: [],
  OpenStakingNet: [],
  PartnerNet: [],
};
