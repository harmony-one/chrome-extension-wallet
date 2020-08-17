<template>
  <div class="lock-page">
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
        'margin-left': getPinMargin(getPinCode.digits),
        'margin-right': getPinMargin(getPinCode.digits),
      }"
    >
      <PincodeInput
        v-model="pin"
        :length="getPinCode.digits"
        :secure="true"
        :characterPreview="false"
        :disabled="!attempts"
        ref="pincodeInput"
      />
    </div>
    <div class="pin-caption" :class="{ 'failed-caption': attempts < 5 }">
      {{ statusCaption }}
    </div>
    <div v-if="lastOpened">
      <div class="lastopen-fromnow-caption">
        Last accessed {{ lastOpenedFromNow }}
      </div>
      <div class="lastopen-time-caption">{{ lastOpened }}</div>
    </div>
    <div class="footer">
      <span>Developed by Harmony Team</span>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import * as storage from "../../services/StorageService";
import moment from "moment-timezone";
const AppInfo = require("../../app.json");
export default {
  data: () => ({
    pin: "",
    pincodeError: false,
    lastOpened: "",
    lastOpenedFromNow: "",
  }),
  computed: {
    ...mapGetters(["getPinCode"]),
    ...mapState({
      attempts: (state) => state.settings.auth.attempts,
      countdown: (state) => state.settings.auth.countdown,
    }),
    version() {
      return "v" + AppInfo.version;
    },
    statusCaption() {
      if (this.attempts === 5)
        return `Input the ${this.getPinCode.digits} digits PIN code`;
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
      if (this.pin.length === this.getPinCode.digits) {
        this.pinCodeComplete();
      }
    },
  },
  async created() {
    const { AppState } = await storage.getValue("AppState");
    if (!AppState) return;
    const { lastOpened } = AppState;
    if (lastOpened) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.lastOpened = moment(lastOpened)
        .tz(timezone)
        .format("YYYY/MM/DD HH:mm:ss z");
      this.lastOpenedFromNow = moment(lastOpened).fromNow();
    }
    if (this.attempts === 0) {
      const { lastClosed } = AppState;
      if (lastClosed) {
        const now = Date.now();
        const passedtime = Math.floor((now - lastClosed) / 1000);
        this.$store.commit(
          "settings/setCountdown",
          Math.max(this.countdown - passedtime, 0)
        );
        this.startCountDown();
      }
    }
  },
  methods: {
    getPinMargin(digits) {
      return digits === 4 ? "50px" : "15px";
    },
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
    async pinCodeComplete() {
      if (this.pin === this.getPinCode.pin) {
        this.$store.dispatch("settings/setLockState", false);
        this.$store.commit("settings/resetFailedTimer");
        const { AppState } = await storage.getValue("AppState");
        storage.saveValue({
          AppState: { ...AppState, lastOpened: Date.now() },
        });
        this.$router.push("/home");
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
      rgba(247, 247, 255, 0.96),
      rgba(247, 247, 255, 0.96)
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
.lastopen-time-caption {
  font-size: 12px;
  margin-top: 5px;
  color: #555;
}
.lastopen-fromnow-caption {
  font-size: 14px;
  margin-top: 10px;
  color: black;
}
.version-info {
  margin-top: 5px;
  font-size: 16px;
  color: grey;
}
</style>
