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
    getContractAddressList() {
      const networkList = Object.keys(this.tokens);
      let addressList = [];
      networkList.forEach((network) => {
        const tokenList = Object.keys(this.tokens[network]);
        tokenList.forEach((token) => {
          addressList.push(this.tokens[network][token].address);
        });
      });
      return addressList;
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
    async loadTokenBalance(tokenSymbol) {
      const symbol = tokenSymbol;
      const findSymbol = this.tokenArray.find((token) => token === symbol);
      if (!findSymbol) return;
      const artifact = this.getTokenArtifact(symbol);
      if (artifact === undefined) return;

      const contractAddress = this.getContractAddress(symbol);
      const decimals = this.getTokenDecimals(symbol);

      let weiBalance = await getTokenBalance(this.address, contractAddress);
      let balance = BigNumber(weiBalance)
        .dividedBy(Math.pow(10, decimals))
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
