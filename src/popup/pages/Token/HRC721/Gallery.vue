<template>
  <div>
    <app-header
      subtitle="My Gallery"
      @refresh="refreshData"
      @networkChanged="$router.push('/hrc721tokens')"
      backRoute="/hrc721tokens"
    />

    <main class="main">
      <div v-if="balance">
        <div class="token-balance">
          You have <span>{{ balance }}</span> items.
        </div>
        <div
          class="nft-container"
          @wheel.prevent="handleScroll"
          ref="nftcontainer"
        >
          <div class="nft-wrapper" v-for="(nft, index) in nfts" :key="index">
            <div v-if="nft.loading" class="pulse-loader">
              <div v-if="!error">
                <NFTLoading color="#0a93eb" size="80px" />
              </div>
              <div
                v-else
                :style="{
                  'white-space': 'nowrap',
                  'text-align': 'center',
                  color: '#888',
                }"
              >
                Image is not available
              </div>
            </div>
            <div class="nft-item" v-else>
              <img :src="nft.image" :alt="nft.name" />
              <div class="name">{{ nft.name }}</div>
              <div class="description" v-tooltip.bottom="nft.description">
                {{ compress(nft.description) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="token-balance">
          You don't own any nfts.
        </div>
      </div>
      <notifications
        group="notify"
        width="200"
        :max="2"
        class="notifiaction-container"
      />
    </main>
  </div>
</template>

<script>
import {
  getContractName,
  getTokenBalance,
  getTokenOfOwnerByIndex,
  getTotalSupply,
  getTokenURI,
} from "services/Hrc721Service";
import Vue from "vue";
import NFTLoading from "./NFTLoading";
import token from "mixins/token";
import BigNumber from "bignumber.js";
export default {
  data: () => ({
    contractAddress: null,
    balance: 0,
    nfts: [],
    error: null,
  }),
  mixins: [token],
  components: {
    NFTLoading,
  },
  methods: {
    handleScroll(e) {
      this.$refs["nftcontainer"].scrollLeft += e.deltaY;
    },
    compress(address) {
      if (address.length > 60)
        return (
          address.substr(0, 30) +
          "..." +
          address.substr(address.length - 30, address.length)
        );
    },
    async refreshData() {
      try {
        this.$store.commit("loading", true);
        this.error = null;
        this.contractAddress = this.$route.params.address;
        const bnBalance = await getTokenBalance(
          this.address,
          this.contractAddress
        );
        if (!bnBalance) throw new Error("Contract address is invalid");
        this.balance = new BigNumber(bnBalance).toNumber();
        const totalSupply = await getTotalSupply(this.contractAddress);
        this.nfts = Array(this.balance).fill({ loading: true });
        this.$store.commit("loading", false);
        this.nfts.forEach(async (elem, index) => {
          try {
            const id = await getTokenOfOwnerByIndex(
              this.address,
              index,
              this.contractAddress
            );
            const uri = await getTokenURI(id, this.contractAddress);
            if (!uri) throw new Error("Get tokenURI failed");
            const response = await fetch(uri, { mode: "cors" });
            const { image, name, description } = await response.json();
            Vue.set(this.nfts, index, {
              image,
              name,
              description,
              loading: false,
            });
          } catch (error) {
            console.error(error);
            this.error = error.message;
            this.$notify({
              group: "notify",
              type: "error",
              text: error.message,
            });
          }
        });
      } catch (error) {
        console.error(error);
        this.$notify({
          group: "notify",
          type: "error",
          text: error.message,
        });
      }
    },
  },
  async mounted() {
    await this.refreshData();
  },
};
</script>

<style lang="scss" scoped>
.nft-container {
  display: flex;
  padding: 1rem 1rem 2rem 1rem;
  overflow-x: auto;
}
.token-balance {
  font-size: 14px;
  text-align: center;
  span {
    color: #0a93eb;
  }
}
.nft-wrapper {
  &:not(:last-child) {
    margin-right: 20px;
  }
  .nft-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  border: 1px solid #ddd;
  box-shadow: 0px 3px 5px #00000033;
  padding: 20px;
  display: flex;
  min-width: 308px;
  position: relative;
  min-height: 400px;
  flex-direction: column;
  align-items: center;
  background: white;
  gap: 10px;
  img {
    width: 200px;
    object-fit: contain;
    margin-bottom: 1rem;
  }
  .pulse-loader {
    top: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
  }
  .name {
    text-align: center;
    font-weight: 600;
    font-size: 1.25rem;
  }
  .description {
    text-align: center;
    font-size: 12px;
    margin-top: 10px;
  }
}
</style>
