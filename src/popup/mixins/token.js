import { mapState } from "vuex";
import { getTokenBalance } from "../../lib/contracts/token-api";
import BigNumber from "bignumber.js";

export default {
  computed: {
    ...mapState({
      tokens: (state) => state.hrc20.tokens,
      network: (state) => state.network,
      address: (state) => state.wallets.active.address,
    }),
    tokenArray() {
      return Object.keys(this.tokens[this.network.chainId]);
    },
  },
  methods: {
    async loadAllTokenBalance() {
      for (var symbol of this.tokenArray) {
        await this.loadTokenBalance(symbol);
      }
    },
    getTokenBalance(symbol) {
      const artifact = this.getTokenArtifact(symbol);
      if (!artifact) return 0;
      return artifact.balance;
    },
    getTokenArtifact(symbol) {
      return this.tokens[this.network.chainId][symbol];
    },
    getContractAddress(symbol) {
      return this.getTokenArtifact(symbol).address;
    },
    getTokenDecimals(symbol) {
      return this.getTokenArtifact(symbol).decimals;
    },
    async loadTokenBalance(symbol) {
      const findIndex = this.tokenArray.find((token) => token === symbol);
      if (!findIndex) return;
      let weiBalance = await getTokenBalance(
        this.address,
        this.getContractAddress(symbol)
      );
      let balance = BigNumber(weiBalance)
        .dividedBy(Math.pow(10, this.getTokenDecimals(symbol)))
        .toFixed(6);
      this.$store.commit("hrc20/loadTokenBalance", {
        network: this.network.chainId,
        symbol,
        balance,
      });
    },
    async refreshTokens() {
      this.$store.commit("loading", true);
      await this.loadAllTokenBalance();
      this.$store.commit("loading", false);
    },
  },
};
