import { intToBuffer, isHexString } from "ethjs-util";

export function calculateSigRecovery(v, chainId) {
  return chainId ? v - (2 * chainId + 35) : v - 27;
}

export function isValidSigRecovery(recovery) {
  return recovery === 0 || recovery === 1;
}

export const setLengthLeft = (msg, length) => {
  assertIsBuffer(msg);
  return setLength(msg, length, false);
};
const assertIsBuffer = (input) => {
  if (!Buffer.isBuffer(input)) {
    const msg = `This method only supports Buffer but input was: ${input}`;
    throw new Error(msg);
  }
};

const zeros = (bytes) => {
  return Buffer.allocUnsafe(bytes).fill(0);
};

const setLength = (msg, length, right) => {
  const buf = zeros(length);
  if (right) {
    if (msg.length < length) {
      msg.copy(buf);
      return buf;
    }
    return msg.slice(0, length);
  } else {
    if (msg.length < length) {
      msg.copy(buf, length - msg.length);
      return buf;
    }
    return msg.slice(-length);
  }
};

export const bufferToHex = function(buf) {
  buf = toBuffer(buf);
  return "0x" + buf.toString("hex");
};

export const toBuffer = (v) => {
  if (v === null || v === undefined) {
    return Buffer.allocUnsafe(0);
  }

  if (Buffer.isBuffer(v)) {
    return Buffer.from(v);
  }

  if (Array.isArray(v) || v instanceof Uint8Array) {
    return Buffer.from(v);
  }

  if (typeof v === "string") {
    if (!isHexString(v)) {
      throw new Error(
        `Cannot convert string to buffer. toBuffer only supports 0x-prefixed hex strings and this string was given: ${v}`
      );
    }
    return Buffer.from(padToEven(stripHexPrefix(v)), "hex");
  }

  if (typeof v === "number") {
    return intToBuffer(v);
  }

  if (BN.isBN(v)) {
    return v.toArrayLike(Buffer);
  }

  if (v.toArray) {
    // converts a BN to a Buffer
    return Buffer.from(v.toArray());
  }

  if (v.toBuffer) {
    return Buffer.from(v.toBuffer());
  }

  throw new Error("invalid type");
};
