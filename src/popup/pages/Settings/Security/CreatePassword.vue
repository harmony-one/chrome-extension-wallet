<template>
  <div class="create-password-page">
    <div class="main-logo">
      <img
        src="images/harmony-big.png"
        class="create-password-logo"
        alt="Harmony"
      />
    </div>
    <div class="title">
      <div class="brand-name">Harmony One Wallet</div>
      <div class="version-info">{{ version }}</div>
    </div>
    <label class="input-label">
      Create a new password
      <input
        class="input-field"
        type="password"
        name="password"
        ref="password"
        v-model="password"
        placeholder="Input the password"
      />
    </label>
    <label class="input-label">
      Confirm the password
      <input
        class="input-field"
        type="password"
        name="password_confirm"
        ref="password_confirm"
        v-model="password_confirm"
        placeholder="Confirm the password"
      />
    </label>
    <button class="primary flex mt-20" @click="createPassword">
      Create Password
    </button>
    <div class="footer credit-title">
      <span>Developed by Harmony Team</span>
    </div>
    <notifications
      group="notify"
      width="250"
      :max="2"
      class="notifiaction-container"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
const AppInfo = require("~/app.json");
export default {
  data: () => ({
    password: "",
    password_confirm: "",
  }),
  computed: {
    ...mapGetters(["getPassword"]),
    version() {
      return "v" + AppInfo.version;
    },
  },
  methods: {
    createPassword() {
      if (this.password.length < 8) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Password must be longer than 8 characters",
        });
        return;
      } else if (this.password !== this.password_confirm) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Password doesn't match",
        });
        return;
      }
    },
  },
  mounted() {
    this.$modal.show("dialog", {
      title: "Important Updates",
      text:
        "Harmony One Wallet recently removes the password for <i><b>each account</b></i> and allows you to have only a <b>Global password</b> like Metamask.\
        <br>You need to migrate all of your accounts in the previous version to the new version. \
        We may ask you to input the password for each account for that.<br><b>First, input your global password to get started.</b>",
      buttons: [
        {
          title: "OK",
          handler: () => {
            this.$modal.hide("dialog");
          },
        },
      ],
    });
  },
};
</script>

<style scoped>
.create-password-page {
  width: 370px;
  height: 600px;
  padding: 1rem;
  position: relative;
  background-image: linear-gradient(
      rgba(247, 247, 255, 0.96),
      rgba(247, 247, 255, 0.96)
    ),
    url("images/harmony.png");
}
.create-password-logo {
  width: 200px;
  height: 200px;
}
.title {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 20px;
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
