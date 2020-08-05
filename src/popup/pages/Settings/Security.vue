<template>
  <div>
    <app-header subtitle="Security" />
    <main class="main">
      <div
        class="list-item"
        v-for="item in options"
        :key="item.title"
        @click="item.handler"
      >{{ item.title }}</div>
      <pindigits-modal />
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import PindigitsModal from "./Security/PindigitsModal";
export default {
  data() {
    return {
      digits: 4,
      options: [
        { title: "Change pin code", handler: () => this.changePincode() },
        { title: "Change pincode digits", handler: () => this.showPindigits() },
        {
          title: "Set lock timer",
          handler: () => this.setIdleTimeout()
        }
      ]
    };
  },
  components: {
    PindigitsModal
  },
  methods: {
    changeDigits(newValue) {
      this.digits = newValue;
    },
    changePincode() {},
    showPindigits() {
      this.$modal.show("modal-pindigits");
    },
    setIdleTimeout() {
      console.log("idletimeout");
    }
  }
};
</script>
<style></style>
