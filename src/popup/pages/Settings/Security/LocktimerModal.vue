<template>
  <modal name="modal-locktimer" :adaptive="true" transition="scale" :width="300" height="auto">
    <div class="modal-header">Set the lock timer</div>
    <div class="modal-body">
      <radio-button
        name="options"
        v-for="item in dataArray"
        :key="item"
        :label="item + ' minutes' + (item === 30 ? ' (default)' : '')"
        :data="item"
        :value="timeout"
        @change="changeTimeout"
      />
    </div>
    <div class="modal-footer">
      <div class="secondary" @click="$modal.hide('modal-locktimer')">CLOSE</div>
      <div class="primary" @click="saveTimeout">SAVE</div>
    </div>
  </modal>
</template>

<script>
import { mapState } from "vuex";
export default {
  data: () => ({
    timeout: 30,
    dataArray: [10, 20, 30, 40, 50, 60]
  }),
  computed: {
    ...mapState({
      lockTimer: state => state.settings.auth.timeout
    })
  },
  mounted() {
    this.timeout = parseInt(this.lockTimer / 60 / 1000);
  },
  methods: {
    changeTimeout(newValue) {
      this.timeout = newValue;
    },
    saveTimeout() {
      this.$store.commit("settings/setTimeout", this.timeout * 60 * 1000);
      this.$modal.hide("modal-locktimer");
    }
  }
};
</script>
