export default {
    namespaced: true,

    state: {
        address: false,
        keypass: false,
        keystore: false
    },

    mutations: {
        address(state, address) {
            state.address = address
        },

        keypass(state, keypass) {
            state.keypass = keypass
        },

        keystore(state, keystore) {
            state.keystore = keystore
        }
    }
}
