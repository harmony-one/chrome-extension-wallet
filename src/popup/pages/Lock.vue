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
    <div class="pin-input">
      <div class="unlock-caption">Unlock your Wallet</div>
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
        />
      </div>
      <div class="pin-caption" :class="{ 'failed-caption': attempts < 5 }">
        {{ statusCaption }}
      </div>
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
import PincodeInput from "vue-pincode-input";
const AppInfo = require("../../app.json");
export default {
  data: () => ({
    pin: "",
    pincodeError: false,
  }),
  components: {
    PincodeInput,
  },
  computed: {
    ...mapState({
      pincode: (state) => state.settings.auth.pincode,
      pindigits: (state) => state.settings.auth.pindigits,
      attempts: (state) => state.settings.auth.attempts,
      delayTime: (state) => state.settings.auth.delayTime,
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
        return `Authentication failed. Try again after`;
      }
    },
  },
  watch: {
    pin() {
      if (this.pin.length === this.pindigits) {
        if (this.pin === this.pincode) {
          this.$store.commit("settings/setLocked", false);
          this.$router.push("/main");
        } else {
          this.pincodeError = true;
          this.pin = "";
          this.$store.commit("settings/setAttempts", this.attempts - 1);
          setTimeout(() => {
            this.pincodeError = false;
          }, 800);
        }
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
div.vue-pincode-input-wrapper {
  display: flex;
  justify-content: space-between;
}
input.vue-pincode-input {
  color: transparent;
  text-shadow: 0 0 0 black;
  height: 40px;
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
.unlock-caption {
  font-size: 20px;
  margin-bottom: 20px;
}
.pin-caption {
  margin-top: 10px;
  font-size: 14px;
  color: grey;
}
.failed-caption {
  color: red;
}
.footer {
  position: fixed;
  left: 50%;
  bottom: 0;
  width: 300px;
  font-size: 14px;
  color: #555;
  transform: translate(-50%, -50%);
  margin: 0 auto;
}

.pin-fail {
  animation: miss 0.8s ease-out 1;
}

@keyframes miss {
  0% {
    transform: translate(0, 0);
  }
  10% {
    transform: translate(-25px, 0);
  }
  20% {
    transform: translate(25px, 0);
  }
  30% {
    transform: translate(-20px, 0);
  }
  40% {
    transform: translate(20px, 0);
  }
  50% {
    transform: translate(-10px, 0);
  }
  60% {
    transform: translate(10px, 0);
  }
  70% {
    transform: translate(-5px, 0);
  }
  80% {
    transform: translate(5px, 0);
  }
  100% {
    transform: translate(0, 0);
  }
}
</style>
