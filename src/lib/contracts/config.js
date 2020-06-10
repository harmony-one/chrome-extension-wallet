const H20 = require("./artifacts/h20.json");
const USDC = require("./artifacts/usdc.json");

export const TOKENS = {
  H20: {
    artifacts: H20,
  },
  USDC: {
    artifacts: USDC,
  },
};

export const VALIDTOKENS = {
  Mainnet: ["H20", "USDC"],
  Pangaea: [],
  Testnet: ["H20"],
  Localnet: [],
  OpenStakingNet: [],
  PartnerNet: [],
};
