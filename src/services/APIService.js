import {
  THIRDPARTY_FORGET_IDENTITY_REQUEST_RESPONSE,
  THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE,
  THIRDPARTY_SIGN_REQUEST_RESPONSE,
  HARMONY_RESPONSE_TYPE,
  ONEWALLETPROVIDER_MESSAGE_LISTENER,
} from "~/types";
import _ from "lodash";
import Config from "~/config";
import { Harmony } from "@harmony-js/core";
import { Unit } from "@harmony-js/utils";

const getHarmony = (chainId) => {
  const network = _.find(Config.networks, { chainId });
  const harmony = new Harmony(
    // rpc url
    network.apiUrl,
    {
      chainType: network.type,
      chainId: network.chainId,
    }
  );
  return harmony;
};
export const createTransaction = ({
  chainId,
  from,
  to,
  amount,
  gasLimit,
  fromShard,
  toShard,
  gasPrice,
  nonce,
  data,
}) => {
  const harmony = getHarmony(chainId);
  const txn = harmony.transactions.newTx({
    from,
    to,
    value: new harmony.utils.Unit(amount)
      .asEther()
      .toWei()
      .toString(),
    gasLimit,
    shardID: fromShard,
    toShardID: toShard,
    gasPrice: new harmony.utils.Unit(gasPrice)
      .asGwei()
      .toWei()
      .toString(),
    nonce,
    data,
  });
  return txn;
};
export const createDelegateTransaction = ({
  from,
  to,
  amount,
  gasLimit,
  gasPrice,
  chainId,
  nonce,
}) => {
  const harmony = getHarmony(chainId);
  const stakingTxn = harmony.stakings
    .delegate({
      delegatorAddress: from,
      validatorAddress: to,
      amount: new Unit(amount).asEther().toHex(),
    })
    .setTxParams({
      nonce,
      gasLimit: new Unit(gasLimit).asWei().toHex(),
      gasPrice: new Unit(gasPrice).asGwei().toHex(),
      chainId,
    })
    .build();
  return stakingTxn;
};
export const createUndelegateTransaction = ({
  from,
  to,
  amount,
  gasLimit,
  gasPrice,
  chainId,
  nonce,
}) => {
  const harmony = getHarmony(chainId);
  const stakingTxn = harmony.stakings
    .undelegate({
      delegatorAddress: from,
      validatorAddress: to,
      amount: new Unit(amount).asEther().toHex(),
    })
    .setTxParams({
      nonce,
      gasLimit: new Unit(gasLimit).asWei().toHex(),
      gasPrice: new Unit(gasPrice).asGwei().toHex(),
      chainId,
    })
    .build();
  return stakingTxn;
};
export const createRewardsTransaction = ({
  from,
  gasLimit,
  gasPrice,
  chainId,
  nonce,
}) => {
  const harmony = getHarmony(chainId);
  const stakingTxn = harmony.stakings
    .collectRewards({
      delegatorAddress: from,
    })
    .setTxParams({
      nonce,
      gasLimit: new Unit(gasLimit).asWei().toHex(),
      gasPrice: new Unit(gasPrice).asGwei().toHex(),
      chainId,
    })
    .build();
  return stakingTxn;
};

export const msgToContentScript = (type, payload) => ({
  type: HARMONY_RESPONSE_TYPE,
  message: {
    type,
    payload,
  },
});

export const sendEventToContentScript = (type, payload) => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {
        type: ONEWALLETPROVIDER_MESSAGE_LISTENER,
        message: {
          type,
          payload,
        },
      });
    });
  });
};
class APIService {
  constructor() {
    this.params = null;
    this.txnInfo = null;
    this.type = null;
    this.sender = null;
    this.popupId = null;
    this.host = "";
    this.activeSession = null;
  }
  getState = () => {
    return {
      type: this.type,
      host: this.host,
      txnInfo: this.txnInfo,
      params: this.params,
      session: this.activeSession,
    };
  };
  sendMessageToInjectScript = (type, payload) => {
    chrome.tabs.sendMessage(this.sender, msgToContentScript(type, payload));
  };
  openPopup = async (route, width, height) => {
    const _this = this;
    chrome.windows.getCurrent({ windowTypes: ["normal"] }, function(window) {
      chrome.windows.create(
        {
          url: `chrome-extension://${chrome.runtime.id}/popup.html#/${route}`,
          type: "popup",
          left: screen.width / 2 - width / 2 + window.left,
          top: screen.height / 2 - height / 2 + window.top,
          width: width,
          height: height,
        },
        function(window) {
          _this.popupId = window.id;
        }
      );
    });
  };
  revokeSession = (index) => {
    //access vuex store via local storage directly, bad implementation
    const storefromLocal = this.getVuexState();
    console.log(storefromLocal);
    const { sessions } = storefromLocal.provider;
    if (!sessions[index]) {
      console.error("revokeSession ===> Session is not found");
      return;
    }
    storefromLocal.provider.sessions.splice(index, 1);
    console.log(storefromLocal);
    this.setVuexState(storefromLocal);
  };
  forgetIdentity = async (tabid, hostname) => {
    this.sender = tabid;
    this.host = hostname;

    if (this.getSessionByHost(hostname)) {
      this.revokeSession(this.getSessionIndex(hostname));
    }
    this.sendMessageToInjectScript(THIRDPARTY_FORGET_IDENTITY_REQUEST_RESPONSE);
  };
  getAccount = async (tabid, hostname) => {
    try {
      const storefromLocal = this.getVuexState(); //vuex store from localstorage, it's not syncing correctly
      this.sender = tabid;
      this.host = hostname;
      const session = this.getSessionByHost(hostname);
      if (storefromLocal && session && session.accounts.length > 0) {
        const address = session.accounts[0];
        const findAcc = _.find(storefromLocal.wallets.accounts, {
          address,
        });
        if (!findAcc) {
          this.sendMessageToInjectScript(
            THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE,
            {
              rejected: true,
              message:
                "The account is found in the session but not in the extension. Please use window.onewallet.forgetIdentity() first to sign out",
            }
          );
          return;
        }
        this.sendMessageToInjectScript(
          THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE,
          address
        );
      } else this.openPopup("login", 400, 600);
    } catch (err) {
      this.sendMessageToInjectScript(THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE, {
        rejected: true,
        message: JSON.stringify(err),
      });
    }
  };
  setVuexState = (state) => {
    try {
      const vuex = JSON.stringify(state);
      window.localStorage.setItem("vuex", vuex);
    } catch (err) {
      console.error(err);
    }
  };
  getVuexState = () => {
    try {
      if (!window.localStorage.getItem("vuex"))
        throw new Error("Vuex Store is not found");
      const vuex = JSON.parse(window.localStorage.getItem("vuex"));
      if (!vuex || !vuex.wallets)
        throw new Error("Wallet is not defined in the vuex store");
      return vuex;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
  prepareSignTransaction = async (tabid, hostname, payload) => {
    try {
      const storefromLocal = this.getVuexState();
      this.sender = tabid;
      this.host = hostname;
      this.type = payload.type;
      this.params = payload.params;
      this.txnInfo = payload.txnInfo;
      const session = this.getSessionByHost(hostname);
      if (storefromLocal && session && session.accounts.length > 0) {
        const address = session.accounts[0];
        const findAcc = _.find(storefromLocal.wallets.accounts, {
          address,
        });
        if (!findAcc) {
          this.sendMessageToInjectScript(THIRDPARTY_SIGN_REQUEST_RESPONSE, {
            rejected: true,
            message:
              "The account is found in the session but not in the extension. Please use window.onewallet.forgetIdentity() first to sign out",
          });
          return;
        }
        this.activeSession = session;
        if (this.isDataExist()) this.openPopup("sign", 400, 610);
        else this.openPopup("sign", 400, 550);
      } else {
        this.sendMessageToInjectScript(THIRDPARTY_SIGN_REQUEST_RESPONSE, {
          rejected: true,
          message:
            "The account is not selected. Please use window.onewallet.getAccount() first to sign the transaction",
        });
      }
    } catch (err) {
      this.sendMessageToInjectScript(THIRDPARTY_SIGN_REQUEST_RESPONSE, {
        rejected: true,
        message: JSON.stringify(err),
      });
    }
  };
  onGetSignatureKeySuccess = (payload) => {
    this.sendMessageToInjectScript(THIRDPARTY_SIGN_REQUEST_RESPONSE, payload);
    this.closeWindow();
  };
  isDataExist = () => {
    return this.txnInfo.data && this.txnInfo.data !== "0x";
  };
  onGetSignatureKeyReject = ({ message }) => {
    this.sendMessageToInjectScript(THIRDPARTY_SIGN_REQUEST_RESPONSE, {
      rejected: true,
      message,
    });
    this.closeWindow();
  };

  getSessionIndex = (hostname) => {
    const storefromLocal = this.getVuexState();
    return _.findIndex(storefromLocal.provider.sessions, { host: hostname });
  };

  getAllSession = () => {
    const storefromLocal = this.getVuexState();
    const { sessions } = storefromLocal.provider;
    if (!sessions) return false;
    return sessions;
  };

  getSessionByHost = (hostname) => {
    const storefromLocal = this.getVuexState();
    let sessionList = storefromLocal.provider.sessions;
    const session = _.find(sessionList, { host: hostname });
    if (!session) {
      return false;
    }
    return session;
  };
  setSessionAccounts = (host, accounts) => {
    //access vuex store via local storage directly, bad implementation
    const storefromLocal = this.getVuexState();
    const index = this.getSessionIndex(host);
    if (index < 0)
      storefromLocal.provider.sessions.push({
        host,
        accounts,
      });
    else storefromLocal.provider.sessions[index].accounts = [...accounts];
    this.setVuexState(storefromLocal);
  };
  onGetAccountSuccess = async (payload) => {
    this.setSessionAccounts(this.host, payload);
    this.sendMessageToInjectScript(
      THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE,
      payload[0]
    );
    this.closeWindow();
  };
  onGetAccountReject = ({ message }) => {
    this.sendMessageToInjectScript(THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE, {
      rejected: true,
      message,
    });
    this.closeWindow();
  };
  closeWindow = () => {
    chrome.windows.remove(this.popupId);
  };
}
const apiService = new APIService();

export default apiService;
