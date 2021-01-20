import { mapState } from "vuex";
import { getTokenBalance } from "services/Hrc20Service";
import BigNumber from "bignumber.js";
import _ from "lodash";

export default {
  computed: {
    ...mapState({
      hrc20tokens: (state) => state.hrc20.tokens,
      hrc721tokens: (state) => state.hrc721.tokens,
      network: (state) => state.network,
      address: (state) => state.wallets.active.address,
    }),
    hrc20tokenArrayOfNetwork() {
      return this.hrc20tokens[this.network.name];
    },
    hrc721tokenArrayOfNetwork() {
      return this.hrc721tokens[this.network.name];
    },
    getHRC20ContractAddressList() {
      const networkList = Object.keys(this.hrc20tokens);
      let addressList = [];
      networkList.forEach((network) => {
        this.hrc20tokens[network].forEach((token) => {
          addressList.push(token.address);
        });
      });
      return addressList;
    },
    getHRC721ContractAddressList() {
      const networkList = Object.keys(this.hrc721tokens);
      let addressList = [];
      networkList.forEach((network) => {
        this.hrc20tokens[network].forEach((token) => {
          addressList.push(token.address);
        });
      });
      return addressList;
    },
  },
  methods: {
    loadAllTokenBalance() {
      this.hrc20tokenArrayOfNetwork.forEach(async (token) => {
        await this.loadTokenBalance(token);
      });
    },
    getTokenBalance(token) {
      const { balance } = _.find(this.hrc20tokenArrayOfNetwork, {
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
        .toFixed();
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
