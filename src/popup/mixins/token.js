import { mapState } from "vuex";
import { getTokenBalance } from "../../lib/contracts/token-api";
import { Unit } from "@harmony-js/utils";

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
        let balance = Number(Unit.Wei(bigbalance).toEther()).toFixed(6);
        this.$store.commit("hrc20/loadTokenBalance", { token, balance });
      }
    },
    async refreshTokens() {
      this.$store.commit("loading", true);
      await this.loadTokenBalance();
      this.$store.commit("loading", false);
    },
  },
};
