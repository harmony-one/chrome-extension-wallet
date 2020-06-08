import { mapState } from "vuex";
import { getTokenBalance } from "../../lib/contracts/token-api";
import BigNumber from "bignumber.js";
BigNumber.config({ ROUNDING_MODE: 3 });

export default {
  computed: mapState({
    tokens: (state) => state.hrc20.tokens,
    network: (state) => state.network,
    address: (state) => state.wallets.active.address,
  }),

  methods: {
    async loadTokenBalance() {
      for (var token of this.network.tokens) {
        let bigbalance = await getTokenBalance(
          this.address,
          this.tokens[token].artifacts
        );
        const balance = Number(
          BigNumber(bigbalance)
            .dividedBy(Math.pow(10, this.tokens[token].decimal))
            .toFixed(6)
        );
        this.$store.commit("hrc20/loadBalance", { token, balance });
      }
    },
    async refreshTokens() {
      this.$store.commit("loading", true);
      await this.loadTokenBalance();
      this.$store.commit("loading", false);
    },
  },
};
