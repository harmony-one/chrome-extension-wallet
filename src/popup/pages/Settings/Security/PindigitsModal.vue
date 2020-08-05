<template>
  <modal
    name="modal-pindigits"
    :adaptive="true"
    transition="scale"
    :width="250"
    height="auto"
  >
    <div class="modal-header">
      Change pin digits
    </div>
    <div class="modal-body">
      <radio-button
        name="options"
        label="4 digits (default)"
        data="4"
        :value="digits"
        @change="changeDigits"
      />
      <radio-button
        name="options"
        label="6 digits"
        data="6"
        :value="digits"
        @change="changeDigits"
      />
    </div>
    <div class="modal-footer">
      <div class="secondary" @click="$modal.hide('modal-pindigits')">
        CLOSE
      </div>
      <div class="primary">
        SAVE
      </div>
    </div>
  </modal>
</template>

<script>
import { mapState } from "vuex";
export default {};
</script>
