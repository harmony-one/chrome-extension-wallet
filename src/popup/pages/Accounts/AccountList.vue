<template>
  <section></section>
</template>

<script>
import apiService from "services/APIService";
import { mapState } from "vuex";
import helper from "mixins/helper";
export default {
  props: ["accounts"],
  data: () => ({}),
  mixins: [helper],
  created() {
    console.log(this.accounts);
  },
  mounted() {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
