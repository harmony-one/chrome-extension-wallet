<template>
  <div>
    <app-header
      v-if="!subModule"
      subtitle="Update your password"
      :backRoute="!subModule ? '/settings/security' : ''"
    />
    <div :class="{ main: !subModule }">
      <div class="main-logo">
        <img
          src="images/harmony-big.png"
          class="create-password-logo"
          alt="Harmony"
        />
      </div>
      <div v-if="method === 'update'">
        <label class="input-label">
          Input the old password
          <input
            class="input-field"
            type="password"
            name="oldPassword"
            ref="oldPassword"
            v-model="oldPassword"
            placeholder="Input the old password"
          />
        </label>
      </div>
      <label class="input-label">
        Create a new password
        <input
          class="input-field"
          type="password"
          name="password"
          ref="password"
          v-model="password"
          placeholder="Input the new password"
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
          v-on:keyup.enter="createPassword"
        />
      </label>
      <div class="button-group">
        <button class="outline" @click="onBackClicked">
          Back
        </button>
        <button class="primary" :disabled="!password" @click="createPassword">
          Create
        </button>
      </div>
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
import { decryptKeyStore, encryptKeyStore } from "services/AccountService";
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
    password: "",
    password_confirm: "",
    oldPassword: "",
  }),
  computed: {
    ...mapGetters(["getPassword"]),
    ...mapState({
      accounts: (state) => state.wallets.accounts,
      active: (state) => state.wallets.active,
    }),
  },
  methods: {
    onBackClicked() {
      if (this.onBack) this.onBack();
      else this.$router.go(-1);
    },
    createPassword() {
      if (this.method === "update" && this.oldPassword !== this.getPassword) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Old password is not correct",
        });
        return;
      }
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

      this.$store.commit("loading", true);
      this.$store.dispatch("settings/setPassword", this.password);
      let newAccounts = [];
      this.accounts.forEach(async (acc) => {
        if (!acc.isLedger) {
          console.log(acc);
          const privateKey = await decryptKeyStore(
            this.getPassword,
            acc.keystore
          );
          const keystore = await encryptKeyStore(this.password, privateKey);
          newAccounts.push({ ...acc, keystore });
        } else {
          newAccounts.push(acc);
        }
      });

      this.$store.commit("wallets/setAccount", newAccounts);
      this.$store.commit("wallets/setActive", this.active.address);
      this.$store.commit("loading", false);

      if (!this.subModule) {
        this.$router.push("/settings/security");
      } else {
        this.$emit("success", this.password);
      }
    },
  },
};
</script>

<style scoped>
.create-password-logo {
  width: 130px;
  height: 130px;
}
</style>
