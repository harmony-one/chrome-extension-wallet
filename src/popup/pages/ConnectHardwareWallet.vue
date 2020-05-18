<template>
  <div>
    <app-header @refresh="refreshAccount" headerTab="create-tab" />
    <main class="main connect-wallet">
      <div class="main-logo">
        <img src="images/harmony.png" alt="Harmony" />
      </div>
      <h3>Connect a hardware wallet</h3>
      <span class="form-label">Select a ledger hardware wallet</span>
      <div class="wallet-group">
        <button class="but-ledger" @click="connect">
          <img src="images/ledger.svg" alt="Ledger" />
        </button>
      </div>
      <div class="button-group">
        <button class="actionBtn outline" @click="$router.push('/')">Cancel</button>
        <button class="actionBtn" type="submit" @click="connect">Connect</button>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AppHeader from "../components/AppHeader.vue";

export default {
  data: () => ({
    error: {
      show: false,
      message: ""
    }
  }),
  components: {
    AppHeader
  },
  methods: {
    connect() {}
  }
};
</script>
<style scoped>
.button-group {
  display: flex;
  justify-content: space-between;
}
.form-label {
  font-size: 0.8rem;
}
.actionBtn {
  font-size: 13px;
  padding: 10px;
  font-weight: 400;
  min-width: 70px;
  width: 45%;
  color: white;
  border-radius: 0.3rem;
  cursor: pointer;
  background: #0a93eb;
  transition: all 0.5s ease;
  white-space: nowrap;
  outline: none;
  border: none;
}
.actionBtn:hover,
.actionBtn:focus {
  background-color: #0987d7;
}
.actionBtn:disabled {
  background: #e0e0e0;
  color: #888;
}
.actionBtn.outline {
  background: rgba(10, 147, 235, 0.05) !important;
  border: 2px solid #0987d7 !important;
  color: black !important;
}
.but-ledger {
  background: white;
  padding: 2rem;
  width: 200px;
  border-radius: 10px;
}
.wallet-group {
  display: flex;
  justify-content: center;
  margin: 30px;
}
</style>