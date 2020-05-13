export default {
    namespaced: true,

    state: {
        balance: 0,
        bandwidth: 0,
        freeBandwidth: 0,
        frozen: 0,
        frozenExpires: 0,
        tokens: [],
        transfers: [],
        transactions:[],
        shardArray:[],
        shard:0,
    },

    mutations: {
        change(state, account) {
            state.balance = account.balance
            state.shardArray = account.shardArray
            state.shard = account.shard

            state.bandwidth = account.bandwidth
            state.freeBandwidth = account.freeBandwidth
            state.frozen = account.frozen
            state.frozenExpires = account.frozenExpires
        },

        shard(state, shard) {
            state.shard = shard
        },

        shardArray(state, shardArray) {
            state.shardArray = shardArray
        },

        balance(state, balance) {
            state.balance = balance
        },

        frozen(state, frozen) {
            state.frozen = frozen
        },

        tokens(state, tokens) {
            state.tokens = tokens
        },

        transfers(state, transfers) {
            state.transfers = transfers
        },

        pushTransfers(state, transfers) {
            state.transfers.push(...transfers)
        },

        transactions(state, transactions) {
            state.transactions = transactions
        },

        pushTransactions(state, transactions) {
            state.transactions.push(...transactions)
        }
    }
}
