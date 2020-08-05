<template>
  <div>
    <app-header subtitle="Settings" />
    <main class="main">
      <div
        class="list-item"
        v-for="item in options"
        :key="item.route"
        @click="$router.push(item.route)"
      >
        {{ item.name }}
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data: () => ({
    options: [{ name: "Security", route: "/settings/security" }],
  }),
};
</script>
