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
        { title: "Change the PIN Code", handler: () => this.changePincode() },
        {
          title: "Change the PIN Code digits",
          handler: () => this.showPindigitsModal(),
        },
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
    changePincode() {
      this.$router.push("/settings/security/pincode");
    },
    showPindigitsModal() {
      this.$modal.show("modal-pindigits");
    },
    showLockTimerModal() {
      this.$modal.show("modal-locktimer");
    },
  },
};
</script>
<style></style>
