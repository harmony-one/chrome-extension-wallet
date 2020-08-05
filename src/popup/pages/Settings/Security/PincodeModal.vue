<template>
  <div>
    <app-header v-if="method === 'update'" subtitle="Set up your pin code" />
    <div class="pincode-page">
      <div v-if="scene === 0">
        <div class="unlock-caption">Input your old pin code</div>
        <div
          class="pin-container"
          :class="{ 'pin-fail': errorcode === 1 }"
          :style="{
            'margin-left': pindigits === 4 ? '50px' : '0',
            'margin-right': pindigits === 4 ? '50px' : '0',
          }"
        >
          <PincodeInput
            v-model="oldpin"
            :length="pindigits"
            :secure="true"
            :characterPreview="true"
            ref="oldpincodeInput"
          />
        </div>
        <div class="pin-caption" :class="{ 'failed-caption': errorcode === 1 }">{{ statusCaption }}</div>
      </div>
      <div v-else-if="scene === 1">
        <div class="unlock-caption">Set up your pin code</div>
        <div
          class="pin-container"
          :style="{
            'margin-left': pindigits === 4 ? '50px' : '0',
            'margin-right': pindigits === 4 ? '50px' : '0',
          }"
        >
          <PincodeInput
            v-model="pin"
            :length="pindigits"
            :secure="true"
            :characterPreview="true"
            ref="pincodeInput"
          />
        </div>
        <div class="pin-caption">{{ defaultCaption }}</div>
      </div>
      <div v-else-if="scene === 2">
        <div class="unlock-caption">Confirm your pin code</div>
        <div
          class="pin-container"
          :class="{ 'pin-fail': errorcode === 2 }"
          :style="{
            'margin-left': pindigits === 4 ? '50px' : '0',
            'margin-right': pindigits === 4 ? '50px' : '0',
          }"
        >
          <PincodeInput
            v-model="pinconfirm"
            :length="pindigits"
            :secure="true"
            :characterPreview="true"
            ref="pincodeConfirmInput"
            :disabled="!attempts"
          />
        </div>
        <div class="pin-caption" :class="{ 'failed-caption': errorcode === 2 }">{{ statusCaption }}</div>
        <div class="footer">
          <button class="full-but" v-if="!attempts" @click="onRetry">Retry</button>
          <button class="full-but" v-if="success" @click="onSuccess">Done</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: {
    method: {
      default: "create",
      type: String
    }
  },
  data: () => ({
    oldpin: "",
    pin: "",
    pinconfirm: "",
    errorcode: 0,
    attempts: 3,
    scene: 0,
    success: false
  }),
  watch: {
    pin() {
      if (this.pin.length === this.pindigits) {
        this.scene = 2;
      }
    },
    pinconfirm() {
      if (this.pinconfirm.length === this.pindigits) {
        this.pinInputComplete();
      }
    },
    oldpin() {
      if (this.oldpin.length === this.pindigits) {
        this.oldpinInputComplete();
      }
    }
  },
  computed: {
    ...mapState({
      pincode: state => state.settings.auth.pincode,
      pindigits: state => state.settings.auth.pindigits
    }),
    defaultCaption() {
      return `Input the ${this.pindigits} digits pin code`;
    },
    statusCaption() {
      if (this.errorcode === 1) return "Old pin code is not correct";
      else if (this.errorcode === 2) return "Pin code doesn't match";
      return this.defaultCaption;
    }
  },
  mounted() {
    if (this.method === "create") {
      if (!this.pincode) this.scene = 1;
      else this.$emit("success");
    } else if (this.method === "update") {
      this.scene = 0;
    }
  },
  methods: {
    onRetry() {
      this.attempts = 3;
      this.errorcode = 0;
      this.pin = "";
      this.pinconfirm = "";
      this.scene = 1;
      this.$nextTick(() => this.$refs.pincodeInput.$el.children[0].focus());
    },
    oldpinInputComplete() {
      if (this.oldpin === this.pincode) {
        this.scene = 1;
      } else {
        this.errorcode = 1;
        setTimeout(() => {
          this.errorcode = 0;
          this.oldpin = "";
        }, 800);
      }
    },
    pinInputComplete() {
      if (this.pinconfirm === this.pin) {
        this.success = true;
      } else {
        this.errorcode = 2;
        setTimeout(() => {
          this.errorcode = 0;
          this.pinconfirm = "";
          this.attempts = Math.max(this.attempts - 1, 0);
        }, 800);
      }
    },
    onSuccess() {
      this.$store.commit("settings/setPincode", this.pinconfirm);
      this.$emit("success");
      if (this.method === "update") {
        this.$router.push("/settings/security");
      }
    }
  }
};
</script>
<style scoped>
.pincode-page {
  text-align: center;
}
</style>
