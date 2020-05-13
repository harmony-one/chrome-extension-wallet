import tokens from '../../../tokens'

export default {
    namespaced: true,

    state: {
        tokens: tokens
    },

    mutations: {
        tokens(state, tokens) {
            state.tokens = tokens
        }
    }
}
