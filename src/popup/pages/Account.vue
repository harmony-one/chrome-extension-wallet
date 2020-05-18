<template>
  <div>
    <app-header @refresh="refreshAccount" headerTab="main-tab" />

    <main class="main">
      <div class="box highlight">
        <div class="account-box" @click="onClickAccount()">
          <h2 class="name-label">Account 1</h2>
          <div class="box-address">{{ compressAddress(address) }}</div>
        </div>

        <div class="box-label">Account Balance</div>

        <div class="box-balance">
          {{ $formatNumber(account.balance, { maximumSignificantDigits: 7 }) }}
        </div>
        <div class="box-balance-code">ONE</div>

        <!-- Shard -->
        <div class="box-address-label">Shard</div>
        <select v-model="shard">
          <option
            v-for="item in account.shardArray"
            :value="item.shardID"
            :key="item.shardID"
            >{{ item.shardID }}</option
          >
        </select>

        <div class="box-buttons">
          <router-link class="green" to="/receive">
            <span>Receive</span>
          </router-link>
          <router-link class="red" to="/send">
            <span>Send</span>
          </router-link>
        </div>
      </div>
      <notifications
        group="copied"
        width="180"
        type="info"
        max="2"
        class="notifiaction-container"
      />
    </main>
  </div>
</template>

<script>
import account from "../mixins/account";
import AppHeader from "../components/AppHeader.vue";
import MainTab from "../components/MainTab.vue";

export default {
  mixins: [account],

  components: {
    AppHeader,
    MainTab,
  },

  data: () => ({
    shard: 0,
  }),

  mounted() {
    if (
      typeof this.account.shard !== "undefined" ||
      this.account.shard !== null
    ) {
      this.shard = this.account.shard;
    } else {
      this.$store.commit("account/shard", 0);
      this.shard = 0;
    }

    this.loadShardingInfo();
    this.loadBalance();
  },

  watch: {
    shard(newValue, oldValue) {
      this.$store.commit("account/shard", newValue);
      this.loadBalance();
      // window.location.reload();
    },
  },

  methods: {
    onClickAccount() {
      this.$copyText(this.address)
        .then(() => {
          this.$notify({
            group: "copied",
            text: "Copied to Clipboard",
          });
        })
        .error((err) => {
          console.log(err);
        });
    },
    compressAddress(address) {
      return (
        address.substr(0, 15) +
        "..." +
        address.substr(address.length - 5, address.length)
      );
    },
  },
};
</script>
<style scoped>
.name-label {
  margin: 0.5rem;
}
.account-box {
  border-radius: 10px;
  padding: 0.5rem;
  margin: 0 3rem 1.5rem 3rem;
}
.account-box:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}
.account-box:active {
  background: #f0f0f0;
}
.toast-container {
  border-radius: 5px;
  max-width: 200px;
}
.notifiaction-container {
  margin-top: 50px;
}
</style>
