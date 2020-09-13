<template>
  <div>
    <app-header
      v-if="!subModule"
      subtitle="Update your pincode"
      :backRoute="!subModule ? '/settings/security' : ''"
    />
    <div class="pincode-page" :class="{ main: !subModule }">
      <div v-if="scene === 0">
        <div class="pin-label">Input the Old PIN Code</div>
        <div
          class="pin-container"
          :class="{ 'pin-fail': pinfail }"
          :style="{
            'margin-left': getPinMargin(getPinCode.digits),
            'margin-right': getPinMargin(getPinCode.digits),
          }"
        >
          <PincodeInput
            v-model="oldpin"
            :length="getPinCode.digits"
            :secure="true"
            :characterPreview="false"
            ref="oldpincodeInput"
          />
        </div>
        <div class="pin-caption" :class="{ 'failed-caption': errorcode === 1 }">{{ statusCaption }}</div>
      </div>
      <div v-else-if="scene === 1">
        <div class="pin-label">Set up a New PIN Code</div>
        <div
          class="pin-container"
          :style="{
            'margin-left': getPinMargin(pindigits),
            'margin-right': getPinMargin(pindigits),
          }"
        >
          <PincodeInput
            v-model="pin"
            :length="pindigits"
            :secure="true"
            :characterPreview="false"
            ref="pincodeInput"
          />
        </div>
      </div>
      <div v-else-if="scene === 2">
        <div class="pin-label">Confirm the PIN Code</div>
        <div
          class="pin-container"
          :class="{ 'pin-fail': pinfail }"
          :style="{
            'margin-left': getPinMargin(pindigits),
            'margin-right': getPinMargin(pindigits),
          }"
        >
          <PincodeInput
            v-model="pinconfirm"
            :length="pindigits"
            :secure="true"
            :characterPreview="false"
            ref="pincodeConfirmInput"
            :disabled="!attempts"
          />
        </div>
        <div class="pin-caption" :class="{ 'failed-caption': errorcode === 2 }">{{ statusCaption }}</div>
      </div>
      <div class="footer">
        <button class="flex mt-20" v-if="!attempts" @click="onRetry">Retry</button>
        <button class="flex mt-20" v-else @click="onBackClicked">Back</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
export default {
  props: {
    method: {
      default: "create",
      type: String,
    },
    subModule: {
      default: true,
      type: Boolean,
    },
    onBack: {
      type: Function,
    },
  },
  data: () => ({
    oldpin: "",
    pin: "",
    pinconfirm: "",
    errorcode: 0,
    attempts: 3,
    scene: 1,
    pinfail: false,
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
      if (this.oldpin.length === this.getPinCode.digits) {
        this.oldpinInputComplete();
      }
    },
  },
  computed: {
    ...mapGetters(["getPinCode"]),
    ...mapState({
      pindigits: (state) => state.settings.auth.pindigits,
    }),
    statusCaption() {
      if (this.errorcode === 1) return "PIN Code is not correct";
      else if (this.errorcode === 2) return "PIN Code doesn't match";
      return "";
    },
    isPincodeEmpty() {
      return !this.getPinCode;
    },
  },
  mounted() {
    if (this.method === "create") {
      if (this.isPincodeEmpty) this.scene = 1;
      else this.$emit("success");
    } else if (this.method === "update") {
      if (this.isPincodeEmpty) this.scene = 1;
      else this.scene = 0;
    }
  },
  methods: {
    onBackClicked() {
      if (this.onBack) this.onBack();
      else this.$router.go(-1);
    },
    getPinMargin(digits) {
      return digits === 4 ? "50px" : "15px";
    },
    onRetry() {
      this.attempts = 3;
      this.errorcode = 0;
      this.pin = "";
      this.pinconfirm = "";
      this.scene = 1;
      this.$nextTick(() => this.$refs.pincodeInput.$el.children[0].focus());
    },
    oldpinInputComplete() {
      if (this.oldpin === this.getPinCode.pin) {
        this.scene = 1;
        this.errorcode = 0;
      } else {
        this.errorcode = 1;
        this.pinfail = true;
        setTimeout(() => {
          this.pinfail = false;
          this.oldpin = "";
        }, 800);
      }
    },
    pinInputComplete() {
      if (this.pinconfirm === this.pin) {
        this.errorcode = 0;
        this.$store.dispatch("settings/setPincode", this.pinconfirm);
        setTimeout(() => {
          if (!this.subModule) {
            this.$router.push("/settings/security");
          } else {
            this.$emit("success");
          }
        }, 300);
      } else {
        this.errorcode = 2;
        this.pinfail = true;
        setTimeout(() => {
          this.pinfail = false;
          this.pinconfirm = "";
          this.attempts = Math.max(this.attempts - 1, 0);
        }, 800);
      }
    },
  },
};
</script>
<style scoped>
.pincode-page {
  text-align: center;
}
</style>
