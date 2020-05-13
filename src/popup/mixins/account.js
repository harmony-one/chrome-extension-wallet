import API from '../../lib/api'
import { mapState } from 'vuex'
import {getBalance, getShardInfo} from '../../lib/keystore'
import { Unit } from '@harmony-js/utils';
import token from './token'

export default {
    mixins: [token],

    computed: mapState({
        account: state => state.account,
        address: state => state.wallet.address
    }),

    methods: {
        async loadShardingInfo() {
            let shardArray = await getShardInfo()
            this.$store.commit('account/shardArray', shardArray)
            return shardArray
        },

        async loadBalance() {
            let result = await getBalance(this.address, this.account.shard)
            let balance = Unit.Wei(result).toEther()
            this.$store.commit('account/balance', balance)
            console.log('balance = ', balance)
            //TODO: update this fake token balances
            var tokens = [{
                balance: balance,
                name: '_'
            }, {
                balance: 100000000,
                name: 'H2O'
            }, {
                balance: 0,
                name: 'USDC'
            }
            ]

            this.$store.commit('account/tokens', tokens)
            await this.loadTokenData()
        },

        async refreshAccount() {
            this.$store.commit('loading', true)
            await this.loadShardingInfo()
            await this.loadBalance()
            window.location.reload();
            this.$store.commit('loading', false)
        },
    }
}
