import Vue from "vue";
import Router from "vue-router";
// import SignIn from "./pages/SignIn.vue";
import CreateWallet from "./pages/CreateWallet.vue";
import ImportWallet from "./pages/ImportWallet.vue";
import LogIn from "./pages/LogIn.vue";
import ConnectHardwareWallet from "./pages/ConnectHardwareWallet.vue";
import Account from "./pages/Account.vue";
import Tokens from "./pages/Tokens.vue";
import Transfers from "./pages/Transfers.vue";
import SignTransaction from "./pages/SignTransaction.vue";
import Send from "./pages/Send.vue";
import SendToken from "./pages/SendToken.vue";
import Receive from "./pages/Receive.vue";
import PrivateKey from "./pages/PrivateKey.vue";
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
      path: "/transfers",
      name: "transfers",
      component: Transfers,
      meta: {
        requiredAccount: true,
      },
    },
    {
      path: "/send",
      name: "send",
      component: Send,
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
      path: "/send-token",
      name: "send-token",
      component: SendToken,
      meta: {
        requiredAccount: true,
      },
    },
    {
      path: "/receive",
      name: "receive",
      component: Receive,
      meta: {
        requiredAccount: true,
      },
    },
    {
      path: "/private-key",
      name: "private-key",
      component: PrivateKey,
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
      next({ path: "/create-wallet" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
