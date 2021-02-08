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
          You owned <span>{{ balance }}</span>
          {{ balance > 1 ? "items" : "item" }}
        </div>
        <div
          class="nft-container"
          @wheel.prevent="handleScroll"
          ref="nftcontainer"
        >
          <div class="nft-wrapper" v-for="(nft, index) in nfts" :key="index">
            <div v-if="nft.loading" class="pulse-loader">
              <NFTLoading color="#0a93eb" size="80px" />
            </div>
            <div class="nft-item" v-else-if="nft.uri">
              <img :src="nft.image" :alt="nft.name" />
              <div class="info-container">
                <div class="name">
                  {{ nft.name }}
                  <popper
                    trigger="click"
                    :options="{ placement: 'top' }"
                    v-if="nft.attributes && nft.attributes.length > 0"
                  >
                    <div class="popper">
                      <div
                        v-for="(info, index) in nft.attributes"
                        :key="index"
                        class="popper-item"
                      >
                        <span class="trait_type">{{
                          `${toTraitTypeString(info["trait_type"])}:`
                        }}</span>
                        <span class="value">{{ info["value"] }}</span>
                      </div>
                    </div>
                    <a href="#" slot="reference" class="info">
                      <i class="material-icons">info</i>
                    </a>
                  </popper>
                </div>
              </div>
              <div class="description" v-tooltip.bottom="nft.description">
                {{ compress(nft.description) }}
              </div>
            </div>
            <div v-else class="nft-item">
              <img src="images/NFT_icon.png" width="200px" height="300px" />
              <div class="tokenId" v-if="nft.id">Item ID: {{ nft.id }}</div>
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
  getTokensOfOwner,
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
  }),
  mixins: [token],
  components: {
    NFTLoading,
  },
  methods: {
    handleScroll(e) {
      this.$refs["nftcontainer"].scrollLeft += e.deltaY;
    },
    toTraitTypeString(trait) {
      const str = trait
        .split("_")
        .map(
          (elem) =>
            elem.charAt(0).toUpperCase() + elem.substr(1, elem.length - 1)
        )
        .join(" ");
      return str;
    },
    compress(address) {
      if (address.length > 60)
        return (
          address.substr(0, 30) +
          "..." +
          address.substr(address.length - 30, address.length)
        );
    },
    IsValidJson(str) {
      try {
        JSON.parse(str);
        console.log("success");
      } catch (e) {
        console.log("error");
        return false;
      }
      return true;
    },
    async refreshData() {
      try {
        this.$store.commit("loading", true);
        this.contractAddress = this.$route.params.address;
        // const testAddress = "one1km7xg8e3xjys7azp9f4xp8hkw79vm2h3f2lade";
        console.log(this.contractAddress);
        const bnBalance = await getTokenBalance(
          this.address,
          this.contractAddress
        );
        if (!bnBalance) throw new Error("Contract address is invalid");
        this.balance = new BigNumber(bnBalance).toNumber();
        // const totalSupply = await getTotalSupply(this.contractAddress);
        this.nfts = Array(this.balance).fill({ loading: true });
        this.$store.commit("loading", false);
        const itemList = await getTokensOfOwner(
          this.address,
          this.contractAddress
        );
        if (itemList && itemList.length > 0) {
          itemList.forEach((elem, index) => {
            const id = new BigNumber(elem).toString();
            Vue.set(this.nfts, index, {
              id,
              loading: false,
            });
          });
        } else {
          this.nfts.forEach(async (elem, index) => {
            try {
              const id = await getTokenOfOwnerByIndex(
                this.address,
                index,
                this.contractAddress
              );
              const uri = await getTokenURI(
                new BigNumber(id).toString(),
                this.contractAddress
              );
              if (uri) {
                const response = await fetch(uri, { mode: "cors" });
                if (response.status === 200) {
                  const jsonResponse = await response.json();
                  if (this.IsValidJson(jsonResponse)) {
                    const {
                      image,
                      name,
                      description,
                      attributes,
                    } = jsonResponse;
                    Vue.set(this.nfts, index, {
                      uri: true,
                      image,
                      name,
                      description,
                      attributes,
                      loading: false,
                    });
                    return;
                  }
                }
              }
              if (id) {
                Vue.set(this.nfts, index, {
                  id: new BigNumber(id).toString(),
                  uri: false,
                  loading: false,
                });
              } else {
                Vue.set(this.nfts, index, {
                  uri: false,
                  loading: false,
                });
              }
            } catch (error) {
              console.error(error);
              this.$notify({
                group: "notify",
                type: "error",
                text: error.message,
              });
            }
          });
        }
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
  .help {
    color: rgb(234 234 234);
    font-size: 12rem;
    text-align: center;
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
  .info-container {
    .name {
      text-align: center;
      font-weight: 600;
      font-size: 1.25rem;
      position: relative;
      .popper {
        width: 200px;
        padding: 1rem;
        text-align: left;
        .popper-item {
          display: flex;
          gap: 5px;
          .trait_type {
            color: #0a93eb;
          }
        }
      }
    }
    .info {
      color: #bbb;
      position: absolute;
      top: 0px;
      font-size: 0.8rem;
    }
  }
  .description {
    text-align: center;
    font-size: 12px;
    height: 20px;
    margin-top: 10px;
  }
}
</style>
