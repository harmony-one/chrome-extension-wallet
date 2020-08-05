<template>
  <div class="lock-page">
    <div class="background"></div>
    <div class="main-logo">
      <img src="images/harmony-big.png" class="lock-logo" alt="Harmony" />
    </div>
    <div class="title">
      <div class="brand-name">Harmony One Wallet</div>
      <div class="version-info">{{ version }}</div>
    </div>
    <div class="unlock-caption">Unlock your wallet</div>
    <div
      class="pin-container"
      :class="{ 'pin-fail': pincodeError ? true : false }"
      :style="{
        'margin-left': pindigits === 4 ? '50px' : '0',
        'margin-right': pindigits === 4 ? '50px' : '0',
      }"
    >
      <PincodeInput
        v-model="pin"
        :length="pindigits"
        :secure="true"
        :characterPreview="false"
        :disabled="!attempts"
        ref="pincodeInput"
      />
    </div>
    <div class="pin-caption" :class="{ 'failed-caption': attempts < 5 }">
      {{ statusCaption }}
    </div>
    <div class="footer">
      <span>
        Developed by Harmony Team
      </span>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as storage from "../../services/StorageService";
const AppInfo = require("../../app.json");
export default {
  data: () => ({
    pin: "",
    pincodeError: false,
  }),
  computed: {
    ...mapState({
      pincode: (state) => state.settings.auth.pincode,
      pindigits: (state) => state.settings.auth.pindigits,
      attempts: (state) => state.settings.auth.attempts,
      countdown: (state) => state.settings.auth.countdown,
    }),
    version() {
      return "v" + AppInfo.version;
    },
    statusCaption() {
      if (this.attempts === 5)
        return `Input the ${this.pindigits} digits pin code`;
      else if (this.attempts > 0)
        return `${this.attempts} ${
          this.attempts > 1 ? "attempts" : "attempt"
        } remaining`;
      else {
        return `Authentication failed. Try again after ${this.formatTime(
          this.countdown
        )}`;
      }
    },
  },
  watch: {
    pin() {
      if (this.pin.length === this.pindigits) {
        this.pinCodeComplete();
      }
    },
  },
  mounted() {
    if (this.attempts === 0) {
      storage.getValue("lastClosed").then((data) => {
        const now = Date.now();
        const lastClosed = data.lastClosed;
        const passedtime = Math.floor((now - lastClosed) / 1000);
        this.$store.commit(
          "settings/setCountdown",
          Math.max(this.countdown - passedtime, 0)
        );
        this.startCountDown();
      });
    }
  },
  methods: {
    startCountDown() {
      const timerID = setInterval(() => {
        const count = this.countdown - 1;
        if (count <= 0) {
          this.$store.commit("settings/resetFailedTimer");
          this.$nextTick(() => this.$refs.pincodeInput.$el.children[0].focus());
          clearInterval(timerID);
        } else this.$store.commit("settings/setCountdown", count);
      }, 1000);
    },
    formatTime(count) {
      return `${String(Math.floor(count / 60)).padStart(2, "0")}:${String(
        parseInt(count % 60)
      ).padStart(2, "0")}`;
    },
    pinCodeComplete() {
      if (this.pin === this.pincode) {
        this.$store.commit("settings/setLocked", false);
        this.$store.commit("settings/resetFailedTimer");
        this.$router.push("/");
      } else {
        this.pincodeError = true;
        this.pin = "";
        if (this.attempts === 1) {
          this.startCountDown();
        }
        this.$store.commit(
          "settings/setAttempts",
          Math.max(this.attempts - 1, 0)
        );
        setTimeout(() => {
          this.pincodeError = false;
        }, 800);
      }
    },
  },
};
</script>

<style>
.lock-page {
  width: 370px;
  height: 600px;
  padding: 1rem;
  text-align: center;
  position: relative;
  background-image: linear-gradient(
      rgba(247, 247, 255, 0.95),
      rgba(247, 247, 255, 0.95)
    ),
    url("images/harmony.png");
}
.lock-logo {
  width: 200px;
  height: 200px;
}
.title {
  margin-top: 10px;
  margin-bottom: 40px;
}
.brand-name {
  font-size: 25px;
  color: black;
}
.version-info {
  margin-top: 5px;
  font-size: 16px;
  color: grey;
}
</style>
