<template>
  <nav class="header-tabs">
    <router-link :class="{ active: myroute.name == 'account' }" to="/main"
      >Account</router-link
    >
    <router-link :class="{ active: myroute.name == 'tokens' }" to="/tokens"
      >Tokens</router-link
    >
    <router-link :class="{ active: myroute.name == 'history' }" to="/history"
      >History</router-link
    >
  </nav>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    subtitle: {
      default: false,
    },
  },
  computed: mapState({
    myroute: (state) => state.route,
  }),
};
</script>
