<template>
     <div class="auth">
        <div class="auth-logo">
            <img src="images/harmony.png" alt="OneWallet">
        </div>

        <h1 class="auth-title">Harmony</h1>

        <div v-show="error.show" class="message error">
            {{ error.message }}
        </div>

        <form @submit="submitForm" action="" method="post" class="auth-form" autocomplete="off">
            <input class="input-field" type="text" placeholder="Private Key" v-model="privateKey">
            <input class="input-field" type="password" name="password" placeholder="New Password (min 8 chars)" v-model="password">

            <div class="form-info">
                This password encrypts your private key. Make sure to remember this password as you will need it to unlock your wallet.
            </div>

            <button class="button brand" type="submit">Import Wallet from Private Key</button>
            <a class="auth-link" @click="$router.back()">Cancel</a>
        </form>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import { encryptKeyStore, validatePrivateKey, importPriveKey } from '../../lib/keystore'

    export default {
        data: () => ({
            password: '',
            privateKey: '',
            error: {
                show: false,
                message: ''
            }
        }),

        computed: mapState({
            address: state => state.wallet.address,
            keystore: state => state.wallet.keystore,
        }),

        methods: {
            submitForm(e) {
                e.preventDefault()

                if (this.password.length < 8) {
                    this.error.show = true
                    this.error.message = 'Password is not long enough'

                    return false
                }

                if (!validatePrivateKey(this.privateKey)) {
                    this.error.show = true
                    this.error.message = 'Please enter a valid private key'

                    return false
                }

                const address = importPriveKey(this.privateKey)
                const keystore = encryptKeyStore(this.password, this.privateKey, address)

                this.$store.commit('wallet/address', address)
                this.$store.commit('wallet/keypass', this.password)
                this.$store.commit('wallet/keystore', keystore)
                this.$router.push('/')
            }
        }
    }
</script>
