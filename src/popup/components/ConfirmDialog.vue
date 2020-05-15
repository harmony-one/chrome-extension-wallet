<template>
  <v-dialog width="400" />
</template>

<script>
export default {
  props: ["text"],

  methods: {
    showDialog() {
      this.$modal.show("dialog", {
        text: this.text,
        buttons: [
          {
            title: "CANCEL",
            class: "vue-dialog-button secondary",
            handler: () => {
              this.$modal.hide("dialog");
            },
          },
          {
            title: "CONFIRM",
            default: true,
            class: "vue-dialog-button primary",
            handler: () => {
              this.$modal.hide("dialog");
              this.$emit("confirmed");
            },
          },
        ],
      });
    },
  },
};
</script>

<style>
.vue-dialog .dialog-content {
  padding: 1rem 0.625rem;
  text-align: center;
}
.vue-dialog-button.primary {
  color: #f44336;
  font-weight: 600;
}
.vue-dialog-button.secondary {
  color: #757575;
}
</style>
