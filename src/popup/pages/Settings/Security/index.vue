<template>
  <div>
    <app-header subtitle="Security" backRoute="/settings" />
    <main class="main">
      <div
        class="list-item"
        v-for="item in options"
        :key="item.title"
        @click="item.handler"
      >
        {{ item.title }}
      </div>
      <locktimer-modal />
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import LocktimerModal from "./LocktimerModal";
export default {
  data() {
    return {
      options: [
        { title: "Change the password", handler: () => this.changePassword() },
        {
          title: "Set the lock timer",
          handler: () => this.showLockTimerModal(),
        },
      ],
    };
  },
  components: {
    LocktimerModal,
  },
  methods: {
    changePassword() {
      this.$router.push("/settings/security/create-password");
    },
    showLockTimerModal() {
      this.$modal.show("modal-locktimer");
    },
  },
};
</script>
<style></style>
