import { mapState } from "vuex";
import { getTokenBalance } from "../../services/Hrc20Service";
import BigNumber from "bignumber.js";
import _ from "lodash";

export default {
  computed: {
    ...mapState({
      tokens: (state) => state.hrc20.tokens,
      network: (state) => state.network,
      address: (state) => state.wallets.active.address,
    }),
    tokenArrayOfNetwork() {
      return this.tokens[this.network.name];
    },
    getContractAddressList() {
      const networkList = Object.keys(this.tokens);
      let addressList = [];
      networkList.forEach((network) => {
        this.tokens[network].forEach((token) => {
          addressList.push(token.address);
        });
      });
      return addressList;
    },
  },
  methods: {
    loadAllTokenBalance() {
      this.tokenArrayOfNetwork.forEach(async (token) => {
        await this.loadTokenBalance(token);
      });
    },
    getTokenBalance(token) {
      const { balance } = _.find(this.tokenArrayOfNetwork, {
        address: token.address,
      });
      return balance;
    },

    async loadTokenBalance(token) {
      const contractAddress = token.address;
      const decimals = token.decimals;
      this.$store.dispatch("hrc20/setTokenBalanceLoading", {
        network: this.network.name,
        token,
        loading: true,
      });
      let weiBalance = await getTokenBalance(this.address, contractAddress);
      if (weiBalance === null) return;
      let balance = BigNumber(weiBalance)
        .dividedBy(Math.pow(10, decimals))
        .toFixed(8);
      this.$store.dispatch("hrc20/loadTokenBalance", {
        network: this.network.name,
        token,
        balance,
      });
    },
    async refreshTokens() {
      this.$store.commit("loading", true);
      this.loadAllTokenBalance();
      this.$store.commit("loading", false);
    },
  },
};
