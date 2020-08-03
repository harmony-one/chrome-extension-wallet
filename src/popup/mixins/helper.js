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
    compressAddress(address, leftOffset = 15, RightOffet = 5) {
      return (
        address.substr(0, leftOffset) +
        "..." +
        address.substr(address.length - RightOffet, address.length)
      );
    },
  },
};
