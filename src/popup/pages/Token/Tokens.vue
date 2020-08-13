<template>
  <div>
    <app-header @refresh="refreshData" headerTab="main-tab" />
    <main class="main">
      <div class="token-container">
        <div v-if="!tokenArrayOfNetwork || account.shard" class="message-empty">
          No tokens found
        </div>

        <div v-else>
          <div
            class="token-row"
            v-for="token in tokenArrayOfNetwork"
            :key="token.symbol"
          >
            <span class="token-name">{{ compressSymbol(token.symbol) }}</span>
            <div v-if="!editing">
              <moon-loader
                :loading="token.isLoading"
                color="#0a93eb"
                size="26px"
              />
              <div class="token-box" v-if="!token.isLoading">
                <span class="token-balance">
                  {{
                    $formatNumber(token.balance, {
                      maximumSignificantDigits: 6,
                    })
                  }}
                </span>
                <button
                  class="token_send_but"
                  :disabled="token.balance <= 0"
                  @click="sendToken(token)"
                >
                  Send
                </button>
              </div>
            </div>
            <div v-else class="token-edit-box">
              <button class="edit_but" @click="editToken(token)">
                Edit
              </button>
              <button class="delete_but" @click="deleteToken(token)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="token-button-footer">
        <div class="token-button-group" v-if="!editing">
          <button class="round add_token" @click="$router.push('/tokens/add')">
            <i class="material-icons">add</i>
          </button>
          <button
            v-if="tokenArrayOfNetwork.length > 0"
            class="round edit_token"
            @click="editStart"
          >
            <i class="material-icons">edit</i>
          </button>
        </div>
        <div v-else>
          <button class="cancel_edit" @click="editStop">
            Cancel
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import account from "../../mixins/account";
import helper from "../../mixins/helper";
import { mapState } from "vuex";
export default {
  data: () => ({
    editing: false,
  }),
  mixins: [account, helper],
  computed: {
    ...mapState({
      activeAcc: (state) => state.wallets.active,
      account: (state) => state.account,
      network: (state) => state.network,
    }),
  },
  async mounted() {
    await this.loadAllTokenBalance();
    this.$forceUpdate();
  },
  methods: {
    editToken(token) {},
    deleteToken(token) {},
    editStart() {
      this.editing = true;
    },
    editStop() {
      this.editing = false;
    },
    compressSymbol(str) {
      if (str.length > 15)
        return (
          str.substr(0, 8) + "..." + str.substr(str.length - 5, str.length)
        );
      return str;
    },
    async refreshData() {
      await this.refreshTokens();
      await this.loadOneBalance();
    },
    sendToken(token) {
      if (this.activeAcc.isLedger)
        this.openExpandPopup(`/send-token/${token.address}`);
      else this.$router.push(`/send-token/${token.address}`);
    },
  },
};
</script>

<style lang="scss" scoped>
.token-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: #ffffff;
  border-radius: 5px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}
.token-box,
.token-edit-box {
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  button {
    padding: 5px;
  }
}
.token-edit-box {
  .edit_but {
    border: none;
    border: 1px solid #0a93eb;
    background: #0a93eb;
    &:hover {
      background: #0987d7;
    }
    &:active {
      background: #1f6bb7;
    }
  }
  .delete_but {
    border: none;
    border: 1px solid #d63e4d;
    background: #d63e4d;
    &:hover {
      background: #eb154e;
    }
    &:active {
      background: #9e1338;
    }
  }
}
.token span {
  display: block;
}
.token-name {
  color: black;
  font-size: 0.875rem;
  max-width: 120px;
  overflow: hidden;
}
.token-balance {
  font-size: 1rem;
  font-weight: 600;
  text-align: right;
  word-break: break-all;
  padding-left: 1rem;
}
button.token_send_but {
  border-radius: 5px;
  color: black;
  width: 60px;
  background: white;
  border: 1px solid #aaa;
  &:hover:enabled {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    cursor: pointer;
  }
  &:active:enabled {
    background: #f0f0f0;
  }
  &:disabled {
    cursor: default;
    color: #ddd;
    border: 1px solid #ddd;
  }
}

.token-container {
  height: calc(100% - 40px);
  overflow: auto;
}
.token-button-group {
  display: flex;
  gap: 10px;
}
.token-button-footer {
  position: absolute;
  right: 20px;
  bottom: 10px;
}
button.cancel_edit {
  width: 80px;
}
</style>
