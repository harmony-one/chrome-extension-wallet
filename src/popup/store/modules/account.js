export default {
  namespaced: true,

  state: {
    balance: 0,
    history: [],
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

    history(state, history) {
      state.history = history;
    },

    pushHistory(state, history) {
      state.history.push(...history);
    },
  },
};
