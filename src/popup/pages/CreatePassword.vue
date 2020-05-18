<template>
  <div class="auth">
    <div class="auth-logo">
      <img src="images/harmony.png" alt="Harmony" />
    </div>

    <h1 class="auth-title">Welcome to Harmony</h1>

    <div v-show="error.show" class="message error">
      {{ error.message }}
    </div>
    <p>Set your Harmony One Wallet Password</p>
    <form
      @submit="submitForm"
      action=""
      method="post"
      class="auth-form"
      autocomplete="off"
    >
      <div class="form-group">
        <label class="form-label">Password</label>
        <input
          class="input-field"
          v-model="password"
          type="password"
          name="password"
          placeholder="New Password (min 8 chars)"
        />
      </div>
      <div class="form-group">
        <label class="form-label">Confirm</label>
        <input
          class="input-field"
          v-model="password_confirm"
          type="password"
          name="password_confirm"
          placeholder="Confirm your Password"
        />
      </div>

      <button class="button brand" type="submit">Create New Password</button>
    </form>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { encryptKeyStore, createAccount } from "../../lib/keystore";

export default {
  data: () => ({
    password: "",
    password_confirm: "",
    error: {
      show: false,
      message: "",
    },
  }),

  computed: mapState({
    keystore: (state) => state.wallet.keystore,
  }),

  methods: {
    submitForm(e) {
      e.preventDefault();

      if (this.password.length < 8) {
        this.error.show = true;
        this.error.message = "Password is not long enough";

        return false;
      } else if (this.password !== this.password_confirm) {
        this.error.show = true;
        this.error.message = "Password doesn't match";

        return false;
      }

      // this.wallet = generateAccount();
      this.wallet = createAccount("test account", this.password);
      console.log(this.wallet);
    },
  },
};
</script>
<style scoped>
.form-label {
  margin: auto;
  padding-right: 0.8rem;
  font-size: 0.8rem;
  width: 100px;
  text-align: left;
}
.form-group {
  display: flex;
  justify-content: space-between;
}
</style>
