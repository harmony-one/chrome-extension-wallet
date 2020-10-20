import Vue from "vue";
import Router from "vue-router";
import AuthRoute from "./AuthRoute.vue";

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
import Settings from "./pages/Settings/index.vue";
import Security from "./pages/Settings/Security/index.vue";
import Contacts from "./pages/Settings/Contacts/index.vue";
import PincodeModal from "./pages/Settings/Security/PincodeModal.vue";
import MigrateAccounts from "./pages/Settings/Security/MigrateAccounts.vue";

import store from "./store";

Vue.use(Router);

const router = new Router({
  routes: [
    //third party api route
    {
      path: "/login",
      name: "login",
      component: LogIn,
    },
    {
      path: "/sign",
      name: "signtransaction",
      component: SignTransaction,
    },
    //end
    {
      path: "/migrate-accounts",
      name: "migrate-accounts",
      component: MigrateAccounts,
    },
    {
      path: "/",
      name: "auth",
      component: AuthRoute,
      meta: {
        requiredAccount: true,
        authenticate: true,
      },
    },
    {
      path: "/home",
      name: "account",
      component: Account,
      meta: {
        requiredAccount: true,
        authenticate: true,
      },
    },
    {
      //token view route
      path: "/tokens",
      name: "tokens",
      component: Tokens,
      meta: {
        requiredAccount: true,
        authenticate: true,
      },
    },
    {
      // add token route
      path: "/tokens/add",
      name: "addtoken",
      component: AddToken,
      meta: {
        requiredAccount: true,
        authenticate: true,
      },
    },
    {
      path: "/history",
      name: "history",
      component: History,
      meta: {
        requiredAccount: true,
        authenticate: true,
      },
    },
    //transaction send route
    {
      path: "/send",
      name: "send",
      component: SendOne,
      meta: {
        requiredAccount: true,
        authenticate: true,
      },
    },
    {
      path: "/send-token/:address",
      name: "send-token",
      component: SendToken,
      meta: {
        requiredAccount: true,
        authenticate: true,
      },
    },
    //end
    {
      path: "/deposit",
      name: "deposit",
      component: Deposit,
      meta: {
        requiredAccount: true,
        authenticate: true,
      },
    },
    {
      path: "/private-key",
      name: "private-key",
      component: ExportPrivateKey,
      meta: {
        requiredAccount: true,
        authenticate: true,
      },
    },
    {
      path: "/about",
      name: "about",
      component: About,
      meta: {
        authenticate: true,
      },
    },
    {
      path: "/lock",
      name: "lock",
      component: Lock,
    },
    //wallet create route
    {
      path: "/create-wallet",
      name: "create-wallet",
      component: CreateWallet,
      meta: {
        authenticate: true,
      },
    },
    {
      path: "/import-wallet",
      name: "import-wallet",
      component: ImportWallet,
      meta: {
        authenticate: true,
      },
    },
    {
      path: "/connect-hardware-wallet",
      name: "connect-hardware-wallet",
      component: ConnectHardwareWallet,
      meta: {
        authenticate: true,
      },
    },
    //end
    //settings route
    {
      path: "/settings",
      name: "settings",
      component: Settings,
      meta: {
        requiredAccount: true,
        authenticate: true,
      },
    },
    {
      path: "/settings/security",
      name: "security",
      component: Security,
      meta: {
        requiredAccount: true,
        authenticate: true,
      },
    },
    {
      path: "/settings/contacts",
      name: "contacts",
      component: Contacts,
      meta: {
        requiredAccount: true,
        authenticate: true,
      },
    },
    {
      path: "/settings/security/pincode",
      name: "pincode",
      component: PincodeModal,
      props: {
        method: "update",
        subModule: false,
      },
      meta: {
        requiredAccount: true,
      },
    },
    //end
  ],
});
router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.authenticate)) {
    if (!store.getters.getPassword && store.state.wallets.accounts.length) {
      next({ path: "/migrate-accounts" });
    }
  }

  if (to.matched.some((record) => record.meta.authenticate)) {
    if (store.getters.getLockState) {
      next({ path: "/lock" });
    }
  }
  if (to.matched.some((record) => record.meta.requiredAccount)) {
    if (!store.state.wallets.accounts.length) {
      chrome.tabs.create({
        url: "popup.html#/create-wallet",
      });
      return;
    }
  }
  next();
});

export default router;
