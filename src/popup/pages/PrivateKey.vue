<template>
    <div>
        <app-header subtitle="Export Private Key" />

        <main class="main">
            <div v-if="wallet">
                <div class="form-info">
                    This is your private key.
                </div>

                <div class="input-group">
                    <textarea class="input-field special" type="text" v-model="wallet.privateKey" readonly></textarea>

                    <button class="button" title="Copy to clipboard" v-clipboard:copy="wallet.privateKey">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="icon"><path d="M6 6V2c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h4zm2 0h4a2 2 0 0 1 2 2v4h4V2H8v4zM2 8v10h10V8H2z"/></svg>
                    </button>
                </div>

                <div class="form-info">
                    <p><strong>Do not lose it!</strong> It can't be recovered if you lose it.</p>
                    <p><strong>Do not share it!</strong> Your funds will be stolen if you use it on a malicious site.</p>
                    <p><strong>Make a backup!</strong> Just in case your laptop is set on fire.</p>
                </div>

                <router-link to="/" class="button brand">I've copied it somewhere safe</router-link>
            </div>

            <div v-else>
                <form @submit.prevent="submitForm" action="" method="post" class="auth-form" autocomplete="off">
                    <div class="form-info">
                        Please enter your password to export the private key.
                    </div>

                    <div v-show="error.show" class="message error">
                        {{ error.message }}
                    </div>

                    <input class="input-field" type="password" name="password" placeholder="Password" v-model="password">

                    <button class="button brand" type="submit">Submit</button>
                </form>
            </div>
        </main>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import { decryptKeyStore } from '../../lib/keystore'
    import AppHeader from '../components/AppHeader.vue'

    export default {
        components: {
            AppHeader
        },

        data: () => ({
            password: '',
            wallet: false,
            error: {
                show: false,
                message: ''
            }
        }),

        computed: mapState({
            keystore: state => state.wallet.keystore,
        }),

        methods: {
            submitForm() {
                const wallet = decryptKeyStore(this.password, this.keystore)

                if (!wallet) {
                    this.error.show = true
                    this.error.message = 'Password is incorrect'

                    return false
                }

                this.wallet = wallet
            }
        }
    }
</script>
