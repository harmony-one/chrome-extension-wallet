<template>
  <main class="prompt image-bg">
    <h3 class="center">Approve Transaction</h3>
    <div class="hostrow">
      <span class="host_label">{{ host }}</span>
    </div>
    <div v-if="!getLockState && !wallet.isLedger">
      <div>
        <span class="action_caption">Signing by</span>
        <span class="sign__name">{{ wallet.name }}</span>
      </div>
      <div class="sign__address">{{ wallet.address }}</div>
      <span class="action_caption">Data</span>
      <div class="data_container">
        {{ getString(signData) }}
      </div>
      <div v-if="!loading">
        <div v-if="!wallet.isLedger" class="password-content">
          <label class="input-label">
            Password
            <input
              class="input-field"
              type="password"
              name="password"
              ref="password"
              v-model="password"
              placeholder="Input your password"
              v-on:keyup.enter="approve"
            />
          </label>
        </div>
        <div class="ledger-content" v-else>
          <b>{{ caption }}</b>
        </div>
      </div>
      <div class="footer">
        <div class="button-group" v-if="!wallet.isLedger">
          <button class="outline" @click="reject">Reject</button>
          <button class="primary" @click="approve" :disabled="!password">
            Approve
          </button>
        </div>
        <div class="button-group" v-else>
          <button class="primary" v-if="!hasError" @click="reject">
            Close
          </button>
          <button class="primary" v-else @click="() => signTransaction(true)">
            Retry
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="getLockState" class="error-container">
        <p>
          Sorry. The wallet is locked. You should unlock it first in the
          extension.
        </p>
      </div>
      <div v-else-if="wallet.isLedger" class="error-container">
        <p>
          Sorry. Currently, OneWallet doesn't support signing the message using
          Ledger Device.
        </p>
      </div>
      <button class="primary flex mt-20" @click="lockReject">OK</button>
    </div>
    <notifications
      group="notify"
      width="250"
      :max="4"
      class="notifiaction-container"
    />
  </main>
</template>
<script>
import { decryptKeyStore } from "services/AccountService";
import { mapState, mapGetters } from "vuex";
import { joinSignature, hexZeroPad, keccak256 } from "@harmony-js/crypto";
import _ from "lodash";
import { strip0x } from "@harmony-js/utils";
import elliptic from "elliptic";
import {
  GET_WALLET_SERVICE_STATE,
  THIRDPARTY_PERSONAL_SIGN_CONNECT,
  THIRDPARTY_PERSONAL_SIGN_SUCCESS_RESPONSE,
  THIRDPARTY_PERSONAL_SIGN_REJECT_RESPONSE,
  WALLET_LOCKED,
  LEDGER_CONFIRM_PREPARE,
} from "~/types";

export default {
  data: () => ({
    loading: false,
    host: "",
    password: "",
    hasError: false,
    signData: false,
    caption: LEDGER_CONFIRM_PREPARE,
    privateKey: null,
    wallet: {
      isLedger: false,
      name: "",
      address: "",
    },
  }),
  computed: {
    ...mapGetters(["getLockState"]),
    ...mapState({
      wallets: (state) => state.wallets,
    }),
  },
  methods: {
    getString(signData) {
      const { msgData } = signData;
      return typeof msgData === "string"
        ? msgData
        : Buffer.from(Object.values(msgData)).toString();
    },
    async personal_sign(signData) {
      try {
        const { msgData, prefixMsg } = signData;
        const data =
          typeof msgData === "string"
            ? Buffer.from(msgData, "utf8")
            : Buffer.from(Object.values(msgData));
        const secp256k1 = elliptic.ec("secp256k1");
        const prefix = Buffer.from(
          `\u0019${prefixMsg}:\n${data.length.toString()}`,
          "utf-8"
        );
        const msgHashHarmony = keccak256(Buffer.concat([prefix, data])).slice(
          2
        );

        const keyPair = secp256k1.keyFromPrivate(
          strip0x(this.privateKey),
          "hex"
        );

        const signature = keyPair.sign(msgHashHarmony, { canonical: true });

        const result = {
          recoveryParam: signature.recoveryParam,
          r: hexZeroPad("0x" + signature.r.toString(16), 32),
          s: hexZeroPad("0x" + signature.s.toString(16), 32),
          v: 27 + signature.recoveryParam,
        };

        chrome.runtime.sendMessage({
          action: THIRDPARTY_PERSONAL_SIGN_SUCCESS_RESPONSE,
          payload: {
            data: joinSignature(result),
          },
        });
      } catch (err) {
        console.error(err);
        this.hasError = true;
        this.caption = err.message;
        this.$notify({
          group: "notify",
          type: "error",
          text: err.message,
        });
      }
    },
    async approve() {
      let privateKey;
      if (!this.password) return;
      if (!this.wallet) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Account is invalid",
        });
        return false;
      }
      privateKey = await decryptKeyStore(this.password, this.wallet.keystore);
      if (!privateKey) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Password is not correct",
        });
        return false;
      }
      this.privateKey = privateKey;

      this.$store.commit("loading", true);
      await this.personal_sign(this.signData);
      this.$store.commit("loading", false);
    },

    async reject() {
      window.close();
    },
    lockReject() {
      chrome.runtime.sendMessage({
        action: THIRDPARTY_PERSONAL_SIGN_REJECT_RESPONSE,
        payload: {
          message: WALLET_LOCKED,
        },
      });
    },
  },
  updated() {
    if (this.$refs.password) this.$refs.password.focus();
  },
  created() {
    this.loading = true;
    chrome.runtime.sendMessage(
      { action: GET_WALLET_SERVICE_STATE },
      async ({ state } = {}) => {
        if (state && state.signData && state.session) {
          try {
            const { signData, session } = state;
            this.signData = signData;
            this.host = session.host;
            this.wallet = _.find(this.wallets.accounts, {
              address: session.account.address,
            });
            this.loading = false;
          } catch (err) {
            console.error(err);
            this.loading = false;
            this.$notify({
              group: "notify",
              type: "error",
              text: err.message,
            });
          }
        } else {
          window.close();
        }
      }
    );
    chrome.runtime.connect({ name: THIRDPARTY_PERSONAL_SIGN_CONNECT });
  },
};
</script>
<style scoped>
.image-bg {
  background-image: linear-gradient(
      rgba(247, 247, 255, 0.97),
      rgba(247, 247, 255, 0.97)
    ),
    url("images/harmony.png");
}
.host_label {
  color: #0987d7;
}
.hostrow {
  margin-bottom: 10px;
  text-align: center;
  font-size: 13px;
}
h3 {
  margin-top: 0px;
  margin-bottom: 0px;
}
.password-content {
  margin-bottom: 10px;
}
.center {
  text-align: center;
}
.action_caption {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 0px;
}
.ledger-content {
  font-style: italic;
  text-align: center;
  margin-top: 20px;
}
.sign__name {
  font-weight: 700;
  color: #0987d7;
}
.sign__address {
  font-size: 12px;
  font-style: italic;
  color: #666;
  margin-bottom: 10px;
}
.error-container {
  height: 360px;
}
.data_container {
  height: 240px;
  word-break: break-all;
  overflow: auto;
  font-size: 12px;
  font-style: italic;
  padding: 5px 0 10px 0;
}
</style>
