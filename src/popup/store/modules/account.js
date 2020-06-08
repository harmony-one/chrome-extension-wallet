export default {
  namespaced: true,

  state: {
    balance: 0,
    transfers: [],
    // transactions: [],
    shardArray: [],
    shard: 0,
  },

  mutations: {
    shard(state, shard) {
      state.shard = shard;
    },

    shardArray(state, shardArray) {
      state.shardArray = shardArray;
    },

    balance(state, balance) {
      state.balance = balance;
    },

    transfers(state, transfers) {
      state.transfers = transfers;
    },

    pushTransfers(state, transfers) {
      state.transfers.push(...transfers);
    },

    // transactions(state, transactions) {
    //   state.transactions = transactions;
    // },

    // pushTransactions(state, transactions) {
    //   state.transactions.push(...transactions);
    // },
  },
};
