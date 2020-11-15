import BigNumber from "bignumber.js";
import _ from "lodash";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState({
      sessions: (state) => state.provider.sessions,
      currentTab: (state) => state.currentTab,
    }),
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
    isSessionExist(host) {
      if (!host) return false;
      const findByHost = this.getSessionByHost(host);
      if (!findByHost || !findByHost.accounts || !findByHost.accounts.length)
        return false;
      return true;
    },
    getSessionByHost(host) {
      return _.find(this.sessions, { host });
    },
    getSessionIndexByHost(host) {
      return _.findIndex(this.sessions, { host });
    },
    async checkSession(address) {
      const findbyAddress = this.sessions.filter(
        (session) => session.accounts && session.accounts.includes(address)
      );
      const sites = findbyAddress.map((elem) => elem.host);
      const domain = this.currentTab;
      let connected = false;
      if (domain && sites.includes(domain)) connected = true;
      return { sites, domain, connected };
    },
  },
};
