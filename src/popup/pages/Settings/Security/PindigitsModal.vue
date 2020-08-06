<template>
  <modal name="modal-pindigits" :adaptive="true" transition="scale" :width="250" height="auto">
    <div class="modal-header">Change the PIN code digits</div>
    <div class="modal-body">
      <radio-button
        name="options"
        v-for="item in dataArray"
        :key="item.data"
        :label="item.label"
        :data="item.data"
        :value="digits"
        @change="changeDigits"
      />
    </div>
    <div class="modal-footer">
      <div class="secondary" @click="$modal.hide('modal-pindigits')">CLOSE</div>
      <div class="primary" @click="saveDigits">SAVE</div>
    </div>
  </modal>
</template>

<script>
import { mapState } from "vuex";
export default {
  data: () => ({
    digits: 4,
    dataArray: [
      { label: "4 digits (default)", data: 4 },
      { label: "6 digits", data: 6 }
    ]
  }),
  computed: {
    ...mapState({
      pindigits: state => state.settings.auth.pindigits
    })
  },
  mounted() {
    this.digits = this.pindigits;
  },
  methods: {
    changeDigits(newValue) {
      this.digits = newValue;
    },
    saveDigits() {
      this.$store.commit("settings/setPindigits", this.digits);
      this.$modal.hide("modal-pindigits");
    }
  }
};
</script>
