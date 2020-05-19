<template>
  <div>
    <app-header @refresh="refreshTransfers" headerTab="main-tab" />

    <main class="main">
      <div v-if="transfers.length === 0" class="message-empty">No transfers yet</div>

      <div v-else>
        <div>
          <external-link
            :url="getTransferLink(transfer.hash)"
            class="transfer"
            v-for="transfer in transfers"
            :key="transfer.hash"
          >
            <span v-if="isOutgoingTransfer(transfer)" class="transfer-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-6 -6.5 24 24"
                width="24"
                height="24"
                preserveAspectRatio="xMinYMin"
                class="icon"
              >
                <path
                  d="M7.828 2.414H2.243a1 1 0 1 1 0-2h8a.997.997 0 0 1 1 1v8a1 1 0 0 1-2 0V3.828l-6.779 6.779A1 1 0 0 1 1.05 9.192l6.778-6.778z"
                />
              </svg>
            </span>
            <span v-else class="transfer-icon incoming">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-6.5 -6.5 24 24"
                width="24"
                height="24"
                preserveAspectRatio="xMinYMin"
                class="icon"
              >
                <path
                  d="M3.828 8.9h5.586a1 1 0 0 1 0 2h-8a.997.997 0 0 1-1-1v-8a1 1 0 1 1 2 0v5.585L9.192.707a1 1 0 1 1 1.415 1.414L3.828 8.9z"
                />
              </svg>
            </span>

            <span class="transfer-content">
              <span
                v-if="isOutgoingTransfer(transfer)"
                class="transfer-address"
              >{{ compressAddress(transfer.to) }}</span>
              <span v-else class="transfer-address">{{ compressAddress(transfer.from) }}</span>

              <span class="transfer-address">{{ formatShard(transfer) }}</span>
              <span class="transfer-date">
                {{
                formatTimestamp(Number(transfer.timestamp) * 1000)
                }}
              </span>
            </span>

            <span
              v-if="isOutgoingTransfer(transfer)"
              class="transfer-amount"
            >- {{ formatTokenAmount(transfer) }}</span>
            <span v-else class="transfer-amount incoming">+ {{ formatTokenAmount(transfer) }}</span>
          </external-link>
        </div>

        <a
          class="load-more"
          v-show="transfers.length < txCount && !loadMoreLoading"
          href="#"
          @click="loadMore"
        >Load More</a>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import moment from "moment-timezone";
const { Unit } = require("@harmony-js/utils");
import {
  getTransfers,
  getNetworkLink,
  getTransactionCount
} from "../../lib/keystore";
import API from "../../lib/api";
import AppHeader from "../components/AppHeader.vue";
import ExternalLink from "../components/ExternalLink.vue";
import token from "../mixins/token";

export default {
  mixins: [token],

  components: {
    AppHeader,
    ExternalLink
  },

  data: () => ({
    limit: 100,
    txCount: 1,
    page: 0,
    loadMoreLoading: false
  }),

  computed: mapState({
    address: state => state.wallets.active.address,
    transfers: state => state.account.transfers
  }),

  mounted() {
    this.loadTransfers();
  },

  methods: {
    async loadTransfers() {
      this.txCount = await getTransactionCount(this.address);
      this.page = 0;
      const transfersData = await getTransfers(
        this.address,
        this.page,
        this.limit
      );
      this.$store.commit("account/transfers", transfersData.transactions);
      this.$store.commit("loading", false);

      await this.loadTokenData();
    },

    async loadMore(e) {
      e.preventDefault();
      this.loadMoreLoading = true;

      this.page += 1;
      const transfersData = await getTransfers(
        this.address,
        this.page,
        this.limit
      );
      this.$store.commit("account/pushTransfers", transfersData.transactions);
      console.log(transfersData);
      console.log(this.transfers.length);
      // BUG: hmy_getTransactionCount does not return correct count, so use this to stop showing "LOAD MORE"
      if (transfersData.transactions.length == 0) {
        this.txCount = this.transfers.length;
        console.log(this.txCount, this.transfers.length);
      }

      this.loadMoreLoading = false;
    },

    refreshTransfers() {
      this.$store.commit("loading", true);
      this.loadTransfers();
    },

    getTransferLink(hash) {
      const path = "/tx/" + hash;

      return getNetworkLink(path);
    },

    isOutgoingTransfer(transfer) {
      return transfer.from === this.address;
    },

    theTokenName(transfer) {
      return "ONE";
    },

    formatTokenAmount(transfer) {
      return new Unit(transfer.value)
        .asWei()
        .toEther()
        .toString();
    },

    formatTimestamp(timestamp) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      return moment(timestamp)
        .tz(timezone)
        .format("MM/DD/YYYY HH:mm:ss z");
    },

    compressAddress(address) {
      return (
        address.substr(0, 10) +
        "..." +
        address.substr(address.length - 5, address.length)
      );
    },

    formatShard(transfer) {
      return (
        "shard from " +
        transfer.shardID.toString() +
        " to " +
        transfer.toShardID.toString()
      );
    }
  }
};
</script>

<style>
.transfer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.5s ease;
  background: #ffffff;
  border-radius: 5px;
  padding: 0;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  color: #424242;
}
.transfer:hover,
.transfer:focus {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}
.transfer:active {
  transform: translateY(1px);
}
.transfer-content,
.transfer-address,
.transfer-date,
.transfer-amount {
  display: block;
}
.transfer-icon {
  display: flex;
  font-size: 24px;
  padding: 8px;
  width: 40px;
  color: #f44336;
}
.transfer-content {
  flex: 1;
  padding: 0.625rem 0;
}
.transfer-address {
  font-weight: 600;
  margin-bottom: 3px;
  color: #424242;
}
.transfer-date {
  color: #bdbdbd;
  font-size: 0.625rem;
}
.transfer-amount {
  flex: 1;
  padding: 0.5rem 0.625rem;
  font-size: 0.75rem;
  word-break: break-all;
  text-align: right;
}
.transfer-icon,
.transfer-amount {
  color: #f44336;
}
.transfer-icon.incoming,
.transfer-amount.incoming {
  color: #8bc34a;
}
</style>
