import { mapState } from "vuex";
import { getTokenBalance } from "../../lib/contracts/token-api";
import { Unit } from "@harmony-js/utils";
import BigNumber from 'BigNumber.js'

export default {
  computed: mapState({
    tokens: (state) => state.hrc20.tokens,
    validTokens: (state) => state.hrc20.validTokens,
    network: (state) => state.network,
    address: (state) => state.wallets.active.address,
  }),

  methods: {
    async loadTokenBalance() {
      for (var symbol of this.validTokens[this.network.name]) {
        console.log("getting balance for token", symbol, "on address", this.address);
        let bigbalance = await getTokenBalance(
          this.address,
          this.tokens[symbol].artifacts
        );

        console.log("bigbalance = ", BigNumber(bigbalance).toString());
        let balance = Number(Unit.Wei(bigbalance).toEther()).toFixed(6);
        console.log("converted balance =",balance );
        this.$store.commit("hrc20/loadTokenBalance", { symbol, balance });
      }
    },
    async refreshTokens() {
      this.$store.commit("loading", true);
      await this.loadTokenBalance();
      this.$store.commit("loading", false);
    },
  },
};
