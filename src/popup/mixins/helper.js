import BigNumber from "bignumber.js";
import apiService from "services/APIService";
import _ from "lodash";
export default {
  computed: {
    isExtendedView() {
      if (window.innerWidth > 370) return true;
      return false;
    },
  },
  methods: {
    openExpandPopup(route) {
      if (!this.isExtendedView) {
        chrome.tabs.create({
          url: `popup.html#${route}`,
        });
      } else {
        this.$router.push(route);
      }
    },
    formatBalance(balance, decimal) {
      return new BigNumber(balance).isEqualTo(0)
        ? 0
        : new BigNumber(balance).toFormat(Math.min(decimal, 36));
    },
    compressString(str, leftOffset = 15, RightOffet = 5) {
      if (str.length > leftOffset + RightOffet + 3)
        return (
          str.substr(0, leftOffset) +
          "..." +
          str.substr(str.length - RightOffet, str.length)
        );
      return str;
    },
    async getCurrentTabUrl() {
      return await new Promise(async (resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(
          tabs
        ) {
          const tab = tabs[0];
          if (tab.url) {
            resolve(new URL(tab.url).host);
            return;
          }
          resolve(false);
        });
      });
    },
    async checkSession(address) {
      return await new Promise(async (resolve) => {
        const sessions = await apiService.getHostSessions();
        const findbyAddress = sessions.filter(
          (session) => session.accounts && session.accounts.includes(address)
        );
        const sites = findbyAddress.map((elem) => elem.host);
        const domain = await this.getCurrentTabUrl();
        let connected = false;
        if (domain && sites.includes(domain)) connected = true;
        resolve({ sites, domain, connected });
      });
    },
  },
};
