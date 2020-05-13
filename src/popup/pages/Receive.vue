<template>
    <div>
        <app-header subtitle="Receive Payment" />

        <main class="main">
            <div class="receive-payment">
                <div class="">Send to the following address</div>

                <div class="input-group">
                    <input class="input-field" type="text" name="address" v-model="address" readonly>
                    <button class="button" title="Copy to clipboard" v-clipboard:copy="address">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="icon"><path d="M6 6V2c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h4zm2 0h4a2 2 0 0 1 2 2v4h4V2H8v4zM2 8v10h10V8H2z"/></svg>
                    </button>
                </div>

                <qrcode-vue :value="address" :size="336" level="H"></qrcode-vue>
            </div>
        </main>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import AppHeader from '../components/AppHeader.vue'
    import QrcodeVue from 'qrcode.vue'

    export default {
        components: {
            AppHeader,
            QrcodeVue
        },

        computed: mapState({
            address: state => state.wallet.address,
        })
    }
</script>

<style>
    .receive-payment {
        font-size: 0.875rem;
    }

    .receive-payment,
    .receive-payment .input-field {
        text-align: center;
    }
</style>

