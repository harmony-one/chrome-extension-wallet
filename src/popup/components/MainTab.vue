<template>
  <nav class="header-tabs">
    <router-link :class="{ active: myroute.name == 'account' }" to="/home"
      >Account</router-link
    >
    <router-link
      :class="{ active: myroute.name == 'hrc20tokens' }"
      to="/hrc20tokens"
      >HRC20</router-link
    >
    <router-link
      :class="{ active: myroute.name == 'hrc721tokens' }"
      to="/hrc721tokens"
      >HRC721</router-link
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
