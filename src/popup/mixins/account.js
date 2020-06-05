import { mapState } from "vuex";
import { getBalance, getShardInfo, getH20Balance } from "../../lib/txnService";
import { Unit } from "@harmony-js/utils";

export default {
  computed: mapState({
    account: (state) => state.account,
    address: (state) => state.wallets.active.address,
  }),

  methods: {
    async loadShardingInfo() {
      let shardArray = await getShardInfo();
      this.$store.commit("account/shardArray", shardArray);
      return shardArray;
    },

    async loadBalance() {
      let result = await getBalance(this.address, this.account.shard);
      let h20Balance = await getH20Balance(this.address);
      let balance = Unit.Wei(result).toEther();
      this.$store.commit("account/balance", balance);
      //TODO: update this fake token balances
      var tokens = [
        {
          balance: balance,
          name: "_",
        },
        {
          balance: h20Balance,
          name: "H20",
        },
      ];
      this.$store.commit("account/tokens", tokens);
    },

    async refreshAccount() {
      this.$store.commit("loading", true);
      // window.location.reload();
      await this.loadShardingInfo();
      await this.loadBalance();
      this.$store.commit("loading", false);
    },
  },
};
