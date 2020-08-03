<template>
  <div>
    <app-header subtitle="Receive Payment" />
    <main class="main">
      <div class="receive-payment">
        <div class>Deposit address</div>

        <div class="input-group">
          <input
            class="input-field"
            type="text"
            name="address"
            v-model="address"
            readonly
          />
          <button
            class="button"
            title="Copy to clipboard"
            @click="copyToClipboard"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              class="icon"
            >
              <path
                d="M6 6V2c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h4zm2 0h4a2 2 0 0 1 2 2v4h4V2H8v4zM2 8v10h10V8H2z"
              />
            </svg>
          </button>
        </div>

        <vue-qr
          :text="address"
          :correctLevel="3"
          :size="336"
          logoSrc="images/logo-blue.png"
          logoScale="0.2"
          logoCornerRadius="35"
          dotScale="0.5"
          margin="0"
          colorLight="rgb(102, 237, 190)"
          colorDark="rgb(1, 174, 231)"
          bgSrc="images/logo-blue.png"
        ></vue-qr>
      </div>
      <notifications
        group="notify"
        width="250"
        :max="2"
        class="notifiaction-container"
      />
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AppHeader from "../components/AppHeader.vue";
import VueQr from "vue-qr";

export default {
  components: {
    AppHeader,
    VueQr,
  },

  computed: mapState({
    address: (state) => state.wallets.active.address,
  }),
  methods: {
    copyToClipboard() {
      this.$copyText(this.address).then(() => {
        this.$notify({
          group: "notify",
          type: "info",
          text: "Copied to Clipboard",
        });
      });
    },
  },
};
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
