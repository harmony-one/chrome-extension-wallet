<template>
    <div>
        <app-header subtitle="Unfreeze Balance" @refresh="refresh" />

        <main class="main">
            <form @submit.prevent="showConfirmDialog" action="" method="post" class="auth-form" autocomplete="off">
                <div class="form-info">
                    Frozen tokens are "locked" for a period of 3 days. During this period the frozen TRX cannot be traded. After this period you can unfreeze the TRX and trade the tokens.
                </div>

                <div v-show="message.show" class="message" :class="[ message.type ]">
                    {{ message.text }}
                </div>

                <div v-show="account.frozen > 0">
                    <label class="input-label">
                        Frozen Balance
                        <input class="input-field" type="text" name="amount" v-model="frozenBalance" readonly>
                    </label>

                    <label class="input-label">
                        Expires
                        <input class="input-field" type="text" name="expires" v-model="frozenExpires" readonly>
                    </label>

                    <button class="button brand" type="submit">Unfreeze Balance</button>
                </div>
            </form>
        </main>

        <confirm-dialog text="Are you sure you want to unfreeze TRX ?" ref="confirmDialog" @confirmed="unfreezeBalance" />
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import { decryptKeyStore } from '../../lib/keystore'
    import API from '../../lib/api'
    import account from '../mixins/account'
    import AppHeader from '../components/AppHeader.vue'
    import ConfirmDialog from '../components/ConfirmDialog.vue'

    export default {
        mixins: [account],

        components: {
            AppHeader,
            ConfirmDialog
        },

        data: () => ({
            message: {
                show: false,
                type: 'error',
                text: ''
            }
        }),

        computed: {
            frozenBalance() {
                return this.$formatNumber(this.account.frozen) + ' TRX'
            },
            frozenExpires() {
                return this.$formatDate(this.account.frozenExpires) + ' ' + this.$formatTime(this.account.frozenExpires)
            },
            ...mapState({
                wallet: state => state.wallet
            })
        },

        mounted() {
            if (this.account.frozen === 0) {
                this.loadAccount()
            }
        },

        methods: {
            async unfreezeBalance() {
                const wallet = decryptKeyStore(this.wallet.keypass, this.wallet.keystore)

                if (!wallet) {
                    this.message.show = true
                    this.message.type = 'error'
                    this.message.text = 'Something went wrong while trying to unfreeze TRX'

                    return false
                }

                this.$store.commit('loading', true)

                try {
                    const { success } = await API().unfreezeBalance(this.wallet.address)(wallet.privateKey)

                    if (success) {
                        this.message.type = 'success'
                        this.message.text = 'TRX has been unfrozen successfully'
                        this.$store.commit('account/frozen', 0)
                    }else {
                        this.message.type = 'error'
                        this.message.text = 'Unable to unfreeze TRX. This could be caused because the minimal freeze period hasn\'t been reached yet'
                    }

                    this.message.show = true
                    this.$store.commit('loading', false)
                    this.loadAccount()
                } catch (e) {
                    this.$store.commit('loading', false)

                    this.message.show = true
                    this.message.type = 'error'
                    this.message.text = 'Unable to unfreeze TRX. This could be caused because the minimal freeze period hasn\'t been reached yet'
                }
            },

            showConfirmDialog() {
                this.message.show = false
                this.$refs.confirmDialog.showDialog()
            },

            refresh() {
                this.message.show = false
                this.refreshAccount()
            }
        }
    }
</script>
