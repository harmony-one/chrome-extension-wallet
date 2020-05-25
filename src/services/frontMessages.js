const RESPONSE_TYPE = "FROM_ONEWALLET_EXTENSION";

export const loginResponse = (address) => ({
  type: RESPONSE_TYPE,
  message: {
    type: "ONEWALLET_SIGN_REQUEST_RESPONSE",
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
