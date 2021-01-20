export const getHostNameFromTab = tab => {
  const url = new URL(tab.url)
  const hostname = url.hostname

  // fail rather than return an empty response
  if (!hostname) {
    throw new Error('cannot get hostname from tab ' + JSON.stringify(tab))
  }

  return hostname
}