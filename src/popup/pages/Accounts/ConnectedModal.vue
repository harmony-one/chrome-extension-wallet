<template>
  <modal
    name="modal-connected-sites"
    :adaptive="true"
    transition="scale"
    :width="300"
    height="auto"
  >
    <div class="modal-header">Connected sites</div>
    <div class="modal-body">
      <div v-if="!connected">Onewallet is not connected this site.</div>
      <div v-else>
        <div v-for="(site, index) in sites" :key="index">
          {{ site }}
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <div class="primary" @click="accept">OK</div>
    </div>
  </modal>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: ["connected", "sites"],
  data: () => ({}),
  computed: {},
  mounted() {},
  methods: {
    accept() {
      this.$modal.hide("modal-connected-sites");
    },
  },
};
</script>
