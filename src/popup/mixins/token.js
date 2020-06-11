import { mapState } from "vuex";
import {
  getTokenBalance,
  increaseTotalSupply,
} from "../../lib/contracts/token-api";
import { Unit } from "@harmony-js/utils";
import BigNumber from "bignumber.js";

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
        let bigbalance = await getTokenBalance(
          this.address,
          this.tokens[symbol].artifacts
        );
        console.log("bigbalance = ", BigNumber(bigbalance).toNumber());
        let balance = Number(Unit.Wei(bigbalance).toEther()).toFixed(6);
        console.log("converted balance =", balance);
        this.$store.commit("hrc20/loadTokenBalance", { symbol, balance });
      }
    },
    async increaseSupply(amount, symbol) {
      ////increase supply
      let ret = await increaseTotalSupply(
        amount,
        this.tokens[symbol].artifacts
      );
      console.log("increase Supply result -----> ", ret);
    },
    async refreshTokens() {
      this.$store.commit("loading", true);
      await this.loadTokenBalance();
      this.$store.commit("loading", false);
    },
  },
};
