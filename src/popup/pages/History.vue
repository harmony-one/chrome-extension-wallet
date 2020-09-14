<template>
  <div>
    <app-header @refresh="refreshHistory" headerTab="main-tab" />
    <main class="main">
      <div v-if="history.length === 0" class="message-empty">No transactions yet</div>

      <div v-else>
        <div>
          <external-link
            :url="getTransferLink(transfer.hash)"
            class="transfer"
            v-for="transfer in history"
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
                v-tooltip.top="transfer.to"
              >{{ compressAddress(transfer.to, 15, 10) }}</span>
              <span v-else class="transfer-address">
                {{
                compressAddress(transfer.from, 20, 10)
                }}
              </span>
              <span
                v-if="isOutgoingTransfer(transfer)"
                class="transfer-amount"
              >- {{ formatTokenAmount(transfer) }}</span>
              <span v-else class="transfer-amount incoming">+ {{ formatTokenAmount(transfer) }}</span>
              <div class="transfer-footer">
                <span class="transfer-shard">{{ formatShard(transfer) }}</span>
                <span class="transfer-date">
                  {{
                  formatTimestamp(Number(transfer.timestamp) * 1000)
                  }}
                </span>
              </div>
            </span>
          </external-link>
        </div>
        <div class="load-more">
          <a
            v-show="history.length < txCount && !loadMoreLoading"
            href="#"
            @click="loadMore"
          >Load More</a>
          <scale-loader :loading="loadMoreLoading" color="#0a93eb" size="26px" />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import moment from "moment-timezone";
import helper from "mixins/helper";
import { Unit } from "@harmony-js/utils";
import {
  getTransfers,
  getNetworkLink,
  getTransactionCount,
  removeDups,
  getHarmony,
} from "services/AccountService";
import { fromBech32 } from "@harmony-js/crypto";
import { decodeInput, getContractInstance } from "services/Hrc20Service";
import ExternalLink from "components/ExternalLink.vue";

export default {
  mixins: [helper],
  components: {
    ExternalLink,
  },

  data: () => ({
    limit: 8,
    txCount: 1,
    page: 0,
    loadMoreLoading: false,
  }),

  computed: mapState({
    address: (state) => state.wallets.active.address,
    history: (state) => state.account.history,
  }),

  async mounted() {
    this.$store.commit("loading", true);
    await this.loadHistory();
  },

  methods: {
    async pushHistory(transactions) {
      let txns = [];
      for (const txn of removeDups(transactions)) {
        const params = await decodeInput(
          getContractInstance(fromBech32(txn.to)),
          txn.input
        );
        const result = {
          from: txn.from,
          to: params ? params.to : txn.to,
          amount: params
            ? params.amount
            : new Unit(txn.value).asWei().toEther().toString(),
          hash: txn.hash,
          symbol: params ? params.symbol : "ONE",
          timestamp: txn.timestamp,
          shardID: txn.shardID,
          toShardID: txn.toShardID,
        };
        txns.push(result);
      }
      this.$store.commit("account/pushHistory", txns);
    },
    async loadHistory() {
      this.$store.commit("account/initHistory");
      this.txCount = await getTransactionCount(this.address);
      this.page = 0;
      const transfersData = await getTransfers(
        this.address,
        this.page,
        this.limit
      );
      await this.pushHistory(transfersData.transactions);
      this.$store.commit("loading", false);
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
      await this.pushHistory(transfersData.transactions);
      // BUG: hmy_getTransactionCount does not return correct count, so use this to stop showing "LOAD MORE"
      if (transfersData.transactions.length == 0) {
        this.txCount = this.history.length;
        //console.log(this.txCount, this.history.length);
      }

      this.loadMoreLoading = false;
    },

    async refreshHistory() {
      this.$store.commit("loading", true);
      await this.loadHistory();
    },

    getTransferLink(hash) {
      const path = "/tx/" + hash;

      return getNetworkLink(path);
    },

    isOutgoingTransfer(transfer) {
      return transfer.from === this.address;
    },

    formatTimestamp(timestamp) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      return moment(timestamp).tz(timezone).format("MM/DD/YYYY HH:mm:ss z");
    },
    formatTokenAmount(transfer) {
      return transfer.amount + " " + transfer.symbol;
    },
    formatShard(transfer) {
      return (
        "Shard " +
        transfer.shardID.toString() +
        " to Shard " +
        transfer.toShardID.toString()
      );
    },
  },
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
.transfer-shard,
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
  color: #424242;
}
.transfer-shard {
  color: #555;
}
.transfer-date {
  color: #bdbdbd;
  font-size: 0.625rem;
}
.transfer-amount {
  flex: 1;
  font-size: 0.75rem;
  margin-top: 5px;
  margin-bottom: 5px;
  word-break: break-all;
}
.transfer-icon,
.transfer-amount {
  color: #f44336;
}
.transfer-icon.incoming,
.transfer-amount.incoming {
  color: #8bc34a;
}
.transfer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: 15px;
}
</style>
