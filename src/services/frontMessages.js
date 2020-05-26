const RESPONSE_TYPE = "FROM_ONEWALLET_EXTENSION";

export const loginResponse = (address) => ({
  type: RESPONSE_TYPE,
  message: {
    type: "ONEWALLET_LOGIN_REQUEST_RESPONSE",
    payload: {
      address,
    },
  },
});

export const closeSession = () => ({
  type: RESPONSE_TYPE,
  message: {
    type: "CLOSE_SESSION_RESPONSE",
  },
});

export const signTransaction = (rawTransaction = "") => ({
  type: RESPONSE_TYPE,
  message: {
    type: "ONEWALLET_SIGN_REQUEST_RESPONSE",
    payload: {
      rawTransaction,
    },
  },
});
export const signTransactionError = (message) => ({
  type: RESPONSE_TYPE,
  message: {
    type: "ONEWALLET_SIGN_REQUEST_RESPONSE",
    payload: {
      error: true,
      message,
    },
  },
});

export const confirmTransaction = (txhash, blockNumbers) => ({
  type: RESPONSE_TYPE,
  message: {
    type: "TRANSACTION_CONFIRM_RESPONSE",
    payload: {
      txhash,
      blockNumbers,
    },
  },
});

export const confirmTransactionError = (txhash, message) => ({
  type: RESPONSE_TYPE,
  message: {
    type: "TRANSACTION_CONFIRM_RESPONSE",
    payload: {
      error: true,
      txhash,
      message,
    },
  },
});
