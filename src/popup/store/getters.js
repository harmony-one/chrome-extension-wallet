import { decryptString } from "services/CryptoService";
export const getPinCode = (state) => {
  try {
    const { auth } = state.settings;
    const { data, digits } = auth.pincode;
    if (data) {
      const pincode = decryptString(data.payload, data.salt);
      return {
        pin: pincode,
        digits,
      };
    }
    return false;
  } catch (err) {
    return false;
  }
};

export const getLockState = (state) => {
  try {
    const { auth } = state.settings;
    const { lockState } = auth;
    if (lockState) {
      const isLocked = decryptString(lockState.payload, lockState.salt);
      return isLocked === "true";
    }
    return false;
  } catch (err) {
    return true;
  }
};

export const getPassword = (state) => {
  try {
    const { auth } = state.settings;
    const { password } = auth;
    if (password) {
      return decryptString(password.payload, password.salt);
    }
    return false;
  } catch (err) {
    return false;
  }
};
