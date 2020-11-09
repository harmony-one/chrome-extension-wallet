import {
  THIRDPARTY_FORGET_IDENTITY_REQUEST_RESPONSE,
  THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE,
  THIRDPARTY_SIGN_REQUEST_RESPONSE,
  HARMONY_RESPONSE_TYPE,
  FROM_BACK_TO_POPUP,
  ONEWALLETPROVIDER_MESSAGE_LISTENER,
  CLOSE_WINDOW,
  SESSION_REVOKED,
} from "~/types";
import * as storage from "./StorageService";
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
    chrome.windows.getCurrent({ windowTypes: ["normal"] }, function(window) {
      chrome.windows.create({
        url: `chrome-extension://${chrome.runtime.id}/popup.html#/${route}`,
        type: "popup",
        left: screen.width / 2 - width / 2 + window.left,
        top: screen.height / 2 - height / 2 + window.top,
        width: width,
        height: height,
      });
    });
  };
  forgetIdentity = async (tabid, hostname) => {
    this.sender = tabid;
    this.host = hostname;

    let sessionList = await this.getHostSessions();
    const existIndex = _.findIndex(sessionList, { host: hostname });
    if (existIndex >= 0) {
      sessionList.splice(existIndex, 1);
      await storage.saveValue({
        session: sessionList,
      });
    }
    this.sendMessageToInjectScript(THIRDPARTY_FORGET_IDENTITY_REQUEST_RESPONSE);
  };
  getAccount = async (tabid, hostname) => {
    try {
      const store = this.getVuexStore();
      this.sender = tabid;
      this.host = hostname;
      const session = await this.getSession(hostname);
      if (store && session.exist) {
        const account = session.accounts
          ? session.accounts[0]
          : session.account;
        const findAcc = _.find(store.wallets.accounts, {
          address: account.address,
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
          account
        );
      } else this.openPopup("login", 400, 600);
    } catch (err) {
      this.sendMessageToInjectScript(THIRDPARTY_GET_ACCOUNT_REQUEST_RESPONSE, {
        rejected: true,
        message: JSON.stringify(err),
      });
    }
  };
  getVuexStore = () => {
    try {
      if (!window.localStorage.vuex) throw new Error("Vuex Store is not found");
      const vuex = JSON.parse(window.localStorage.vuex);
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
      const store = this.getVuexStore();
      this.sender = tabid;
      this.host = hostname;
      this.type = payload.type;
      this.params = payload.params;
      this.txnInfo = payload.txnInfo;
      const session = await this.getSession(hostname);
      if (store && session.exist) {
        const account = session.accounts
          ? session.accounts[0]
          : session.account;
        const findAcc = _.find(store.wallets.accounts, {
          address: account.address,
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

  isSessionExist = async (host) => {
    try {
      let sessionList = await this.getHostSessions();
      const findByHost = _.find(sessionList, { host });
      if (findByHost) return true;
      return false;
    } catch (error) {
      return false;
    }
  };

  revokeSession = async (site, index) => {
    let sessionList = await this.getHostSessions();
    const expiredSession = sessionList[index];
    sessionList.splice(index, 1);
    await storage.saveValue({
      session: sessionList,
    });
    sendEventToContentScript(SESSION_REVOKED, expiredSession);
  };

  getHostSessions = async () => {
    let currentSession = await storage.getValue("session");
    let sessionList = [];
    if (currentSession && Array.isArray(currentSession.session))
      sessionList = currentSession.session;
    return sessionList;
  };
  getSession = async (hostname) => {
    let sessionList = await this.getHostSessions();
    const existIndex = sessionList.findIndex((elem) => elem.host === hostname);
    if (existIndex >= 0) {
      return {
        exist: true,
        ...sessionList[existIndex],
      };
    }
    return {
      exist: false,
    };
  };

  onGetAccountSuccess = async (payload) => {
    let sessionList = await this.getHostSessions();
    const findIndexByHost = _.findIndex(sessionList, { host: this.host });
    if (findIndexByHost < 0)
      sessionList.push({
        host: this.host,
        accounts: [...payload],
      });
    await storage.saveValue({
      session: sessionList,
    });
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
    chrome.runtime.sendMessage({
      type: FROM_BACK_TO_POPUP,
      action: CLOSE_WINDOW,
    });
  };
}
const apiService = new APIService();

export default apiService;
