<template>
  <nav class="header-tabs">
    <router-link :class="{ active: myroute.name == 'account' }" to="/">Account</router-link>
    <router-link :class="{ active: myroute.name == 'tokens' }" to="/tokens">Tokens</router-link>
    <router-link :class="{ active: myroute.name == 'transfers' }" to="/transfers">Transfers</router-link>
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
