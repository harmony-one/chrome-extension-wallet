<template>
    <div>
        <app-header subtitle="Send Payment" @refresh="refreshTokens" />

        <main class="main">
            <form @submit.prevent="showConfirmDialog" action="" method="post" class="auth-form" autocomplete="off">
                <div v-show="message.show" class="message" :class="[ message.type ]">
                    <a href="confirmation link in explorer">{{ message.text }}</a>
                </div>

                <label class="input-label">
                    Receipient Address
                    <input class="input-field" type="text" name="address" v-model="receipient">
                </label>

                <label class="input-label">
                    Token
                    <select class="input-field" v-model="selectedToken">
                        <option v-for="token in account.tokens" :key="token.name" :value="token">
                            {{ getTokenName(token) }}
                        </option>
                    </select>
                </label>

                <label class="input-label">
                    From Shard
                    <input class="input-field" type="number" name="from-shard" v-model="fromShard" >
                </label>

                <label class="input-label">
                    To Shard
                    <input class="input-field" type="number" name="to-shard" v-model="toShard" >
                </label>


                <label class="input-label">
                    Amount
                    <input class="input-field" type="number" name="amount" v-model="amount" step="any">
                </label>

                <button class="button brand" type="submit">Send</button>
            </form>
        </main>

        <confirm-dialog :text="confirmDialogText" ref="confirmDialog" @confirmed="sendPayment" />
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import { decryptKeyStore, transferToken } from '../../lib/keystore'
    import { getTokenAmount, getTokenRawAmount } from '../../lib/utils'
    import { isValidAddress } from '@harmony-js/utils'
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
            amount: 0,
            fromShard: 0,
            toShard:0,
            receipient: '',
            selectedToken: false,
            message: {
                show: false,
                type: 'error',
                text: ''
            }
        }),

        computed: {
            confirmDialogText() {
                return `
                    Are you sure you want to transfer
                    <div><strong>${this.amount} ${this.getTokenName(this.selectedToken)}</strong></div>
                    <div>to</div>
                    <div><strong>${this.receipient}</strong> ?</div>
                `
            },
            ...mapState({
                wallet: state => state.wallet
            })
        },

        mounted() {
            this.setSelectedToken()

            if (this.account.tokens.length === 0) {
                this.loadTokens()
            }
        },

        methods: {
            setSelectedToken() {
                console.log("this.account.tokens = ", this.account.tokens)
                if (this.account.tokens.length > 0) {
                    this.selectedToken = this.account.tokens[0]
                }
                console.log("selected token = ", this.selectedToken)
            },

            async loadTokens() {
                await this.loadBalance()
                this.setSelectedToken()
                this.$store.commit('loading', false)
            },

            async sendPayment() {
                const wallet = decryptKeyStore(this.wallet.keypass, this.wallet.keystore)
                if (!wallet) {
                    this.message.show = true
                    this.message.type = 'error'
                    this.message.text = 'Something went wrong while trying to send the payment'
                    return false
                }

                this.$store.commit('loading', true)
                let amount = this.amount

                if (this.selectedToken.name === "_") {
                    amount = getTokenAmount(this.amount)
                }else {
                    amount = getTokenRawAmount(this.amount, this.getHRC20Details(this.selectedToken.name)[2])
                }

                try {
                    let ret = await transferToken(this.receipient, this.fromShard, this.toShard, amount, wallet.privateKey)

                    this.$store.commit('loading', false)
                    this.message.show = true

                    if (ret.result) {
                        this.message.type = 'success'
                        this.message.text = ret.mesg
                    }else {
                        this.message.type =  'error'
                        this.message.text =  ret.mesg
                    }

                    console.log("this.message.type ", this.message.type )
                    console.log("this.message.text ", this.message.text )

                    this.loadTokens()
                    this.receipient = ''
                    this.amount = 0
                } catch (e) {
                    this.$store.commit('loading', false)

                    console.log("transfer error =", e)
                    this.message.show = true
                    this.message.type = 'error'
                    this.message.text = 'Something went wrong while trying to send the payment'
                }
            },

            showConfirmDialog(){
                this.message.show = false

                if (!isValidAddress(this.receipient)) {
                    this.message.show = true
                    this.message.type = 'error'
                    this.message.text = 'Invalid recipient address'

                    return false
                }

                if (!this.selectedToken) {
                    this.message.show = true
                    this.message.type = 'error'
                    this.message.text = 'Please select token that you want to send'

                    return false
                }

                let precision = 6

                if (this.selectedToken.name !== '_') {
                    precision = parseInt(this.getHRC20Details(this.selectedToken.name)[2])
                }

                if (this.amount > parseFloat(this.getTokenAmount(this.selectedToken.balance, precision))) {
                    this.message.show = true
                    this.message.type = 'error'
                    this.message.text = 'Insufficient funds'

                    return false
                }

                if (this.amount <= 0) {
                    this.message.show = true
                    this.message.type = 'error'
                    this.message.text = 'Invalid token amount'

                    return false
                }

                this.$refs.confirmDialog.showDialog()
            },

            refreshTokens() {
                this.message.show = false
                this.$store.commit('loading', true)
                this.loadTokens()
            },

            getTokenName(token) {
                if (token.name === '_') {
                    return 'ONE'
                }

                return token.name
            },

            getTokenBalance(token) {
                let precision = 6

                if (token.name !== '_') {
                    precision = parseInt(this.getHRC20Details(token.name)[2])
                }

                return this.$formatNumber(this.getTokenAmount(token.balance, precision), { maximumSignificantDigits: precision + 1 })
            }
        }
    }
</script>
