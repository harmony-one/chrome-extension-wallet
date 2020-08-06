<template>
  <label class="radio">
    <input type="radio" :value="data" :name="name" v-model="radioButtonValue" />
    <span>{{ label }}</span>
  </label>
</template>

<script>
export default {
  props: ["name", "label", "data", "value"],
  computed: {
    radioButtonValue: {
      get: function() {
        return this.value;
      },
      set: function() {
        this.$emit("change", this.data);
      }
    }
  }
};
</script>
