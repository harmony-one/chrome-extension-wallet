<template>
  <div>
    <app-header @refresh="refreshAccount" />

    <main class="main">
      <div class="box highlight">
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

        <div class="box-address-label">Address</div>
        <div class="box-address">{{ address }}</div>

        <div class="box-buttons">
          <router-link class="green" to="/receive"
            ><span>Receive</span></router-link
          >
          <router-link class="red" to="/send"><span>Send</span></router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import account from "../mixins/account";
import AppHeader from "../components/AppHeader.vue";

export default {
  mixins: [account],

  components: {
    AppHeader,
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
