<template>
    <div>
        <app-header @refresh="refreshAccount" />

        <main class="main">
            <div class="box highlight">
                <div class="box-label">Account Balance</div>

                <div class="box-balance">{{ $formatNumber(account.balance, { maximumSignificantDigits: 7 }) }}</div>
                <div class="box-balance-code">ONE</div>

                    <!-- Shard -->
                    <div class="box-address-label">Shard</div>
                    <select v-model="shard">
                        <option
                            v-for="item in account.shardArray"
                            :value="item.shardID"
                            :key="item.shardID"
                        >{{item.shardID}}</option>
                    </select>

                <div class="box-address-label">Address</div>
                <div class="box-address">{{ address }}</div>

                <div class="box-buttons">
                    <router-link class="green" to="/receive"><span>Receive</span></router-link>
                    <router-link class="red" to="/send"><span>Send</span></router-link>
                </div>
            </div>

            <div>
                <div class="wallets">
                    <span class="wallets-content">
                        <span class="wallets-address">
                            {{ compressAddress(address) }}
                        </span>
                    </span>

                    <Button @click="$emit('click', open)" class="account__button">test account</Button>
                </div>

                <div class="wallets">
                    <span class="wallets-content">
                        <span class="wallets-address">
                            {{ compressAddress(address) }}
                        </span>
                    </span>

                    <Button @click="$emit('click', open)" class="account__button">test2</Button>
                </div>
            </div>
        </main>
    </div>
</template>

<script>
    import account from '../mixins/account'
    import AppHeader from '../components/AppHeader.vue'

    export default {
        mixins: [account],

        components: {
            AppHeader
        },

        data: () => ({
            shard: 0,
        }),

        mounted() {
            if (typeof(this.account.shard) !== 'undefined' || this.account.shard !== null) {
                this.shard = this.account.shard
            } else {
                this.$store.commit('account/shard', 0)
                this.shard = 0
            }

            this.loadShardingInfo()
            this.loadBalance()
        },

        watch: {
            shard(newValue, oldValue) {
                this.$store.commit('account/shard', newValue)
                this.loadBalance()
                // window.location.reload();
            }
        },

        methods: {
            compressAddress(address) {
                return address.substr(0, 15) + '...' + address.substr(address.length - 5, address.length)
            },
        },
    }
</script>


<style>
    .wallets {
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: box-shadow 0.5s ease;
        background: #FFFFFF;
        border-radius: 5px;
        padding: 0;
        margin-bottom: 0.75rem;
        font-size: 0.75rem;
        color: #424242;
    }
    .wallets:hover,
    .wallets:focus {
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }
    .wallets:active {
        transform: translateY(1px);
    }
    .wallets-content,
    .wallets-address{
        display: block;
    }
    .wallets-icon {
        display: flex;
        font-size: 24px;
        padding: 8px;
        width: 40px;
        color: #F44336;
    }
    .wallets-content {
        flex: 1;
        padding: 0.625rem 0;
    }
    .wallets-address {
        font-weight: 600;
        margin-left: 10px;
        margin-bottom: 3px;
        color: #424242;
    }

    button.account__button {
        font-weight: 600;
        font-size: 14px;
        color: #F44336;
        flex: 0;
        min-width: 120px;
    }
</style>
