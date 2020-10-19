import BigNumber from "bignumber.js";
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
    compressAddress(address, leftOffset = 15, RightOffet = 5) {
      return (
        address.substr(0, leftOffset) +
        "..." +
        address.substr(address.length - RightOffet, address.length)
      );
    },
  },
};
