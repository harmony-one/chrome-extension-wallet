import Vue from "vue";
import Router from "vue-router";

import CreateWallet from "./pages/Wallet/CreateWallet.vue";
import ImportWallet from "./pages/Wallet/ImportWallet.vue";
import ConnectHardwareWallet from "./pages/Wallet/ConnectHardwareWallet.vue";

import LogIn from "./pages/API/LogIn.vue";
import SignTransaction from "./pages/API/SignTransaction.vue";

import Tokens from "./pages/Token/Tokens.vue";
import AddToken from "./pages/Token/AddToken.vue";

import SendOne from "./pages/Send/SendOne.vue";
import SendToken from "./pages/Send/SendToken.vue";

import Account from "./pages/Account.vue";
import History from "./pages/History.vue";
import Deposit from "./pages/Deposit.vue";
import Lock from "./pages/Lock.vue";
import ExportPrivateKey from "./pages/ExportPrivateKey.vue";
import About from "./pages/About.vue";

import store from "./store";

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/login",
      name: "login",
      component: LogIn,
    },
    {
      path: "/",
      name: "account",
      component: Account,
      meta: {
        requiredAccount: true,
      },
    },
    {
      path: "/tokens",
      name: "tokens",
      component: Tokens,
      meta: {
        requiredAccount: true,
      },
    },
    {
      path: "/addtoken",
      name: "addtoken",
      component: AddToken,
      meta: {
        requiredAccount: true,
      },
    },
    {
      path: "/history",
      name: "history",
      component: History,
      meta: {
        requiredAccount: true,
      },
    },
    {
      path: "/send",
      name: "send",
      component: SendOne,
      meta: {
        requiredAccount: true,
      },
    },
    {
      path: "/sign",
      name: "signtransaction",
      component: SignTransaction,
      meta: {
        requiredAccount: true,
      },
    },
    {
      path: "/send-token/:symbol",
      name: "send-token",
      component: SendToken,
      meta: {
        requiredAccount: true,
      },
    },
    {
      path: "/receive",
      name: "receive",
      component: Deposit,
      meta: {
        requiredAccount: true,
      },
    },
    {
      path: "/private-key",
      name: "private-key",
      component: ExportPrivateKey,
      meta: {
        requiredAccount: true,
      },
    },
    {
      path: "/about",
      name: "about",
      component: About,
    },
    {
      path: "/lock",
      name: "lock",
      component: Lock,
    },
    {
      path: "/create-wallet",
      name: "create-wallet",
      component: CreateWallet,
    },
    {
      path: "/import-wallet",
      name: "import-wallet",
      component: ImportWallet,
    },
    {
      path: "/connect-hardware-wallet",
      name: "connect-hardware-wallet",
      component: ConnectHardwareWallet,
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiredAccount)) {
    if (!store.state.wallets.accounts.length) {
      chrome.tabs.create({
        url: "popup.html#/create-wallet",
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
