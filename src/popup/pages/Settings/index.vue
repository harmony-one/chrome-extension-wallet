<template>
  <div>
    <app-header subtitle="Settings" />
    <main class="main">
      <div class="list-container">
        <div
          class="list-item"
          v-for="item in options"
          :key="item.route"
          @click="$router.push(item.route)"
        >
          <i class="material-icons">{{ item.icon }}</i>
          <div class="list-item-content">
            <div>{{ item.name }}</div>
            <div>{{ item.description }}</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data: () => ({
    options: [
      {
        icon: "security",
        name: "Security",
        description:
          "Change the security settings (PIN Code, PIN digits and Lock timer)",
        route: "/settings/security",
      },
    ],
  }),
};
</script>
