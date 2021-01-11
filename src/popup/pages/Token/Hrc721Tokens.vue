<template>
  <div>
    <app-header headerTab="main-tab" />
    <main class="main" :style="{ 'padding-right': '0px' }">
      <div class="token-container">
        <div
          v-if="!hrc721tokenArrayOfNetwork.length || account.shard"
          class="message-empty"
        >
          No tokens found
        </div>

        <div v-else>
          <div
            class="token-row"
            v-for="(token, index) in hrc721tokenArrayOfNetwork"
            @click="selectToken(token)"
            :key="index"
          >
            <span class="contract-name">{{ token.name }}</span>
            <div v-if="editing" class="token-edit-box">
              <button class="primary edit_but" @click="editToken(token)">
                Edit
              </button>
              <button class="primary delete_but" @click="deleteToken(token)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="token-button-footer">
        <div class="token-button-group" v-if="!editing">
          <button
            class="round"
            @click="$router.push('/hrc721tokens/add')"
            v-tooltip.top="'Add token'"
          >
            <i class="material-icons">add</i>
          </button>
          <button
            v-if="hrc721tokenArrayOfNetwork.length > 0"
            class="round green"
            @click="editStart"
            v-tooltip.top="'Edit token'"
          >
            <i class="material-icons">edit</i>
          </button>
        </div>
        <div v-else>
          <button
            class="primary"
            @click="editStop"
            v-tooltip.top="'Finish editing'"
          >
            Done
          </button>
        </div>
      </div>
      <modal
        name="modal-token-edit"
        :adaptive="true"
        transition="scale"
        :width="250"
        height="auto"
      >
        <div class="modal-header">Change the token name</div>
        <div class="modal-body">
          <input
            type="text"
            name="tokenName"
            v-model="tokenName"
            placeholder="Input the token name"
          />
        </div>
        <div class="modal-footer">
          <div class="secondary" @click="$modal.hide('modal-token-edit')">
            CLOSE
          </div>
          <div class="primary" @click="saveTokenName">SAVE</div>
        </div>
      </modal>
    </main>
  </div>
</template>

<script>
import account from "mixins/account";
import helper from "mixins/helper";
import { mapState } from "vuex";
import BigNumber from "bignumber.js";
import _ from "lodash";
export default {
  data: () => ({
    editing: false,
    editingToken: null,
    tokenName: null,
  }),
  mixins: [account, helper],
  computed: {
    ...mapState({
      account: (state) => state.account,
      network: (state) => state.network,
    }),
  },
  methods: {
    selectToken(token) {
      this.$router.push(`/gallery/${token.address}`);
    },
    saveTokenName() {
      this.$modal.hide("modal-token-edit");
      this.$store.dispatch("hrc721/editToken", {
        network: this.network.name,
        token: {
          ...this.editingToken,
          name: this.tokenName,
        },
      });
    },
    editToken(token) {
      this.editingToken = token;
      this.tokenName = token.name;
      this.$modal.show("modal-token-edit");
    },
    deleteToken(token) {
      this.$modal.show("dialog", {
        text: "Are you sure you want to delete this token?",
        buttons: [
          {
            title: "Cancel",
            default: true,
            handler: () => {
              this.$modal.hide("dialog");
            },
          },
          {
            title: "Delete",
            handler: () => {
              this.$modal.hide("dialog");
              this.$store.dispatch("hrc721/deleteToken", {
                network: this.network.name,
                token,
              });
              if (!this.hrc721tokenArrayOfNetwork.length) this.editStop();
            },
          },
        ],
      });
    },
    editStart() {
      this.editing = true;
    },
    editStop() {
      this.editing = false;
      this.tokenName = "";
      this.editingToken = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.token-row {
  display: flex;
  align-items: center;
  cursor: pointer;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: #ffffff;
  border-radius: 5px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  &:hover {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  }
}
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
  outline: none;
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
.contract-name {
  color: black;
  font-size: 0.875rem;
  min-width: 60px;
  overflow: hidden;
}

.token-container {
  padding-right: 1rem;
  overflow: auto;
  height: calc(100% - 85px);
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
</style>
