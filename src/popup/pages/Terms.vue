<template>
  <div>
    <app-header subtitle=""/>
    <main class="main">
      <div class="about">
        <div class="about-content" style="text-align: center">
            <p>This wallet is no longer receiving support or software updates.</p><p>Click "Accept" to continue use at your own risk.</p>
            <p><external-link url="https://docs.harmony.one/home/network/wallets/browser-extensions-wallets/one-wallet">Read announcement</external-link></p>
        </div>
      </div>
    <div class="footer">
        <div class="button-group">
            <button class="primary" @click="onAcceptClick" >Accept</button>      
        </div>
    </div>
    </main>
  </div>
</template>

<script>
import ExternalLink from "components/ExternalLink.vue";

export default {
  components: {
    ExternalLink,
  },
  mounted() {
  },
  methods: {
      onAcceptClick() {
        this.$store.commit("settings/setTermsAccepted", true);
        this.$router.push(this.$route.query.redirect);
      }
  }
};
</script>

<style>
</style>
