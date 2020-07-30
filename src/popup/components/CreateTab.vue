<template>
  <nav class="header-tabs">
    <router-link :class="{ active: myroute.name == 'create-wallet' }" to="/create-wallet">Create</router-link>
    <router-link :class="{ active: myroute.name == 'import-wallet' }" to="/import-wallet">Import</router-link>
    <router-link
      :class="{
        active: myroute.name == 'connect-hardware-wallet',
      }"
      to="/connect-hardware-wallet"
    >Connect</router-link>
  </nav>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    subtitle: {
      default: false
    }
  },
  computed: mapState({
    myroute: state => state.route
  })
};
</script>
