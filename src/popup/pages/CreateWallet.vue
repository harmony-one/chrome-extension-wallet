<template>
  <div>
    <app-header headerTab="create-tab" />
    <main class="main create-wallet">
      <div class="main-logo">
        <img src="images/harmony.png" alt="Harmony" />
      </div>
      <label class="input-label">
        Account Name
        <input
          class="input-field"
          type="text"
          name="name"
          ref="name"
          v-model="name"
          placeholder="Input the account name"
          v-on:keyup.enter="create"
        />
        <div class="error" v-show="showError">Password is incorrect</div>
      </label>

      <div class="button-group">
        <button class="outline" @click="$router.push('/')">Cancel</button>
        <button @click="create" :disabled="!name">Create</button>
      </div>
    </main>
  </div>
</template>

<script>
import account from "../mixins/account";
import AppHeader from "../components/AppHeader.vue";

export default {
  mixins: [account],
  data: () => ({
    name: "",
  }),
  components: {
    AppHeader,
  },
  methods: {
    create() {},
  },
  mounted() {},
};
</script>

<style scoped>
.button-group {
  display: flex;
  justify-content: flex-end;
}
.create-wallet button {
  font-size: 13px;
  padding: 10px;
  font-weight: 400;
  min-width: 70px;
  width: 100px;
  margin-left: 20px;
  color: white;
  border-radius: 0.3rem;
  cursor: pointer;
  background: #0a93eb;
  transition: all 0.5s ease;
  white-space: nowrap;
  outline: none;
  border: none;
}
.create-wallet button:hover,
.create-wallet button:focus {
  background-color: #0987d7;
}
.create-wallet button.outline {
  background: rgba(10, 147, 235, 0.05);
  border: 2px solid #0a93eb;
  color: black;
}
.create-wallet button:disabled {
  background: #e0e0e0;
  color: #888;
}
.error {
  color: red;
  font-size: 10px;
  margin-top: 5px;
}
.create-wallet .input-label {
  font-size: 1rem;
  color: black;
  margin-bottom: 30px !important;
}
.create-wallet .input-label > input {
  margin-top: 15px !important;
}
</style>
