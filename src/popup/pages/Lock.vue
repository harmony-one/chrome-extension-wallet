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
      class="password-container"
      :class="{ 'fail-animate': failed ? true : false }"
    >
      <input
        class="input-field"
        type="password"
        name="password"
        ref="password"
        v-model="password"
        :disabled="!attempts"
        placeholder="Input the password"
        v-on:keyup.enter="checkPassword"
      />
      <button class="round" :disabled="!attempts" @click="checkPassword">
        <i class="material-icons">arrow_forward</i>
      </button>
    </div>
    <div class="password-caption" :class="{ 'failed-caption': attempts < 5 }">
      {{ statusCaption }}
    </div>
    <div v-if="lastOpened">
      <div class="lastopen-fromnow-caption">
        Last accessed {{ lastOpenedFromNow }}
      </div>
      <div class="lastopen-time-caption">{{ lastOpened }}</div>
    </div>
    <div class="footer credit-title">
      <span>Developed by Harmony Team</span>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import * as storage from "services/StorageService";
import moment from "moment-timezone";
const AppInfo = require("~/app.json");
export default {
  data: () => ({
    failed: false,
    lastOpened: "",
    password: "",
    lastOpenedFromNow: "",
  }),
  computed: {
    ...mapGetters(["getPassword"]),
    ...mapState({
      attempts: (state) => state.settings.auth.attempts,
      countdown: (state) => state.settings.auth.countdown,
    }),
    version() {
      return "v" + AppInfo.version;
    },
    statusCaption() {
      if (this.attempts === 5) return ``;
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
  mounted() {
    this.$refs.password.focus();
  },
  methods: {
    startCountDown() {
      const timerID = setInterval(() => {
        const count = this.countdown - 1;
        if (count <= 0) {
          this.$store.commit("settings/resetFailedTimer");
          this.$nextTick(() => this.$refs.password.focus());
          clearInterval(timerID);
        } else this.$store.commit("settings/setCountdown", count);
      }, 1000);
    },
    formatTime(count) {
      return `${String(Math.floor(count / 60)).padStart(2, "0")}:${String(
        parseInt(count % 60)
      ).padStart(2, "0")}`;
    },
    async checkPassword() {
      if (!this.password) return;
      if (this.password === this.getPassword) {
        this.$store.dispatch("settings/setLockState", false);
        this.$store.commit("settings/resetFailedTimer");
        const { AppState } = await storage.getValue("AppState");
        storage.saveValue({
          AppState: { ...AppState, lastOpened: Date.now() },
        });
        this.$router.push("/home");
      } else {
        this.failed = true;
        this.password = "";
        if (this.attempts === 1) {
          this.startCountDown();
        }
        this.$store.commit(
          "settings/setAttempts",
          Math.max(this.attempts - 1, 0)
        );
        setTimeout(() => {
          this.failed = false;
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
.password-container {
  margin: 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
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
