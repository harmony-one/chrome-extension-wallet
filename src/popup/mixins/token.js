import { mapState } from "vuex";
import {
  getTokenBalance,
  //increaseTotalSupply,
  getDecimals,
} from "../../lib/contracts/token-api";
import { Unit } from "@harmony-js/utils";
import { BN } from "bn.js";

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

        let decimals = await getDecimals(this.tokens[symbol].artifacts);
        const bigNumber = new BN(Math.pow(10, 12 - decimals));
        let balance = Number(
          Unit.Wei(bigNumber.mul(bigbalance)).toEther()
        ).toFixed(6);
        this.$store.commit("hrc20/loadTokenBalance", { symbol, balance });
      }
    } /*
    async increaseSupply(amount, symbol) {
      ////increase supply
      let ret = await increaseTotalSupply(
        amount,
        this.tokens[symbol].artifacts
      );
    },*/,
    async refreshTokens() {
      this.$store.commit("loading", true);
      await this.loadTokenBalance();
      this.$store.commit("loading", false);
    },
  },
};
