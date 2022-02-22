import { mapState } from "vuex";
import { getGasPrice, getBalance, getShardInfo } from "services/AccountService";
import { Unit } from "@harmony-js/utils";
import token from "./token";

export default {
  mixins: [token],
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

    async loadOneBalance() {
      let result = await getBalance(this.address, this.account.shard);
      let balance = Unit.Wei(result).toEther();
      this.$store.commit("account/balance", balance);
    },

    async getGasPrice() {
      let gasPrice = await getGasPrice();
      return gasPrice;
    },

    async refreshAccount() {
      this.$store.commit("loading", true);
      await this.loadShardingInfo();
      await this.loadOneBalance();
      this.$store.commit("loading", false);
    },
  },
};
