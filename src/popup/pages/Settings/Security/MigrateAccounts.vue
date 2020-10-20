<template>
  <div class="create-password-page">
    <div class="main-logo">
      <img
        src="images/harmony-big.png"
        class="create-password-logo"
        alt="Harmony"
      />
    </div>
    <div v-if="scene === 1">
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
      <button class="primary flex mt-20" @click="nextToMigrate">
        Next
      </button>
    </div>
    <div v-else-if="scene === 2">
      <div class="migration-caption">
        Migrating
        <b
          ><i>{{ accounts[index].name }}</i></b
        >
      </div>
      <div v-if="!accounts[index].isLedger">
        <label class="input-label">
          Input the account password
          <input
            class="input-field"
            type="password"
            name="accPassword"
            ref="accPassword"
            v-model="accPassword"
            placeholder="Input the password"
          />
        </label>
      </div>
      <div v-else>
        <p>This is a ledger account</p>
      </div>
      <button
        class="primary flex mt-20"
        :class="{ disabled: !accPassword }"
        @click="nextAcc"
      >
        Next
      </button>
    </div>
    <div v-else>
      <div class="title">
        <div class="brand-name">Harmony One Wallet</div>
        <div class="version-info">{{ version }}</div>
      </div>
      <p>
        All done! You are good to go!
      </p>
      <button class="primary flex mt-20" @click="finish">
        Finish
      </button>
    </div>
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
import { decryptKeyStore, encryptKeyStore } from "services/AccountService";
export default {
  data: () => ({
    scene: 1,
    index: 0,
    password: "",
    password_confirm: "",
    newAccounts: [],
    accPassword: "",
  }),
  computed: {
    ...mapGetters(["getPassword"]),
    ...mapState({
      accounts: (state) => state.wallets.accounts,
      active: (state) => state.wallets.active,
    }),
    version() {
      return "v" + AppInfo.version;
    },
  },
  methods: {
    finish() {
      this.$router.push("/home");
    },
    async nextAcc() {
      let privateKey;
      const currAcc = this.accounts[this.index];
      if (!currAcc.isLedger) {
        privateKey = await decryptKeyStore(this.accPassword, currAcc.keystore);

        if (!privateKey) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Password is not correct",
          });
          return;
        }
      }
      if (!currAcc.isLedger) {
        const keystore = await encryptKeyStore(this.password, privateKey);
        this.newAccounts.push({
          name: currAcc.name,
          address: currAcc.address,
          keystore,
          isLedger: false,
        });
      } else {
        this.newAccounts.push({
          name: currAcc.name,
          address: currAcc.address,
          keystore: "",
          isLedger: true,
        });
      }
      if (this.index < this.accounts.length - 1) {
        this.index++;
        this.accPassword = "";
      } else {
        this.$store.dispatch("settings/setPassword", this.password);
        this.$store.dispatch("settings/setLockState", false);
        this.$store.commit("wallets/setAccount", this.newAccounts);
        this.$nextTick(() =>
          this.$store.commit("wallets/setActive", this.active.address)
        );
        this.scene = 3;
      }
    },
    nextToMigrate() {
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
      this.index = 0;
      this.scene = 2;
    },
  },
  mounted() {
    this.$modal.show("dialog", {
      title: "Important Updates",
      text:
        "Harmony One Wallet recently removes the password for <i><b>each account</b></i> and allows you to have only a <b>Global password</b> like Metamask.\
        <br>You need to migrate all of your accounts in the previous version to the new version. \
        We may ask you to input the password for each account for that.<br><b>First, set your global password to get started.</b>",
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
.migration-caption {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 40px;
  font-size: 1.5rem;
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
