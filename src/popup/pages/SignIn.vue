<template>
     <div class="auth">
        <div class="auth-logo">
            <img src="images/harmony.png" alt="Harmony">
        </div>

        <h1 class="auth-title">Harmony</h1>

        <div v-show="error.show" class="message error">
            {{ error.message }}
        </div>

        <form @submit="submitForm" action="" method="post" class="auth-form" autocomplete="off">
            <input class="input-field" type="password" name="password" placeholder="Password" v-model="password">

            <button class="button brand" type="submit">Sign In</button>

            <div class="line-through">
                <span>or</span>
            </div>

            <router-link class="button" to="/create-wallet">Create New Wallet</router-link>
            <router-link class="button" to="/import-wallet">Import Wallet from Private Key</router-link>
        </form>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import { decryptKeyStore } from '../../lib/keystore'

    export default {
        data: () => ({
            password: '',
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

                const wallet = decryptKeyStore(this.password, this.keystore)

                if (!wallet) {
                    this.error.show = true
                    this.error.message = 'Password is incorrect'

                    return false
                }

                this.$store.commit('wallet/address', wallet.address)
                this.$store.commit('wallet/keypass', this.password)
                this.$router.push('/')
            },
        }
    }
</script>
