<template>
  <modal
    name="modal-check-contact"
    :adaptive="true"
    transition="scale"
    :width="300"
    height="auto"
  >
    <div class="modal-body">
      <div>
        This address is not found in the contacts. Do you want to add this
        address?
      </div>
      <div class="check-container">
        <input type="checkbox" id="dontshow" v-model="checked" />
        <label class="dontshow-label" for="dontshow"
          >Don't show this dialog again</label
        >
      </div>
    </div>
    <div class="modal-footer">
      <div class="secondary" @click="cancel">
        No
      </div>
      <div class="primary" @click="accept">Yes</div>
    </div>
  </modal>
</template>

<script>
import { mapState } from "vuex";
export default {
  data: () => ({
    checked: false,
  }),
  methods: {
    cancel() {
      this.$modal.hide("modal-check-contact");
      this.$emit("cancel");
    },
    accept() {
      this.$store.commit("settings/setDontShowContactsModal", this.checked);
      this.$modal.hide("modal-check-contact");
      this.$emit("accept");
    },
  },
};
</script>
<style scoped>
.check-container {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
