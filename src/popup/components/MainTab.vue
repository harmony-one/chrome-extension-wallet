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

<style>
.header-tabs {
  display: flex;
  width: 100%;
}
.header-tabs a {
  display: block;
  flex: 1;
  padding: 0.625rem;
  color: #757575;
  font-size: 0.75rem;
  text-transform: uppercase;
  text-align: center;
}
.header-tabs a.active {
  color: #f44336;
  border-bottom: 2px solid #f44336;
}
.header-tabs a:hover,
.header-tabs a:focus {
  color: #d32f2f;
}
</style>
