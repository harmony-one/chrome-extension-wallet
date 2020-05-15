export function getTokenAmount(rawAmount, precision = 6) {
  return rawAmount;
}

export function getTokenRawAmount(amount, precision = 6) {
  return amount * Math.pow(10, precision);
}
