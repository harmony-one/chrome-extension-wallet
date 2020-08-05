<template>
  <div>
    <app-header subtitle="Settings" />
    <main class="main">
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
export default {
  data: () => ({}),
  components: {
    AppHeader,
  },

  mounted() {},
  methods: {},
};
</script>

<style></style>
