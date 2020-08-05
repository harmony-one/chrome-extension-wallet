<template>
  <div>
    <app-header subtitle="Security" />
    <main class="main">
      <div
        class="list-item"
        v-for="item in options"
        :key="item.title"
        @click="item.handler"
      >
        {{ item.title }}
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      options: [
        { title: "Change pin code", handler: () => this.changePincode() },
        { title: "Change pincode digits", handler: () => this.setPindigits() },
        {
          title: "Set timeout when the extension is idle",
          handler: () => this.setIdleTimeout(),
        },
      ],
    };
  },
  methods: {
    changePincode() {
      console.log("pincode");
    },
    setPindigits() {
      console.log("pindigits");
    },
    setIdleTimeout() {
      console.log("idletimeout");
    },
  },
};
</script>
