import { mapState } from "vuex";
import { getTokenAmount } from "../../lib/utils";

export default {
  computed: mapState({
    hrc20: (state) => state.hrc20.tokens,
  }),

  methods: {
    getTokenAmount,

    async loadTokenData() {
      let tokens = {};

      // tokens[data.tokens[i].id] = data.tokens[i].name + ';' + data.tokens[i].abbr + ';' + data.tokens[i].precision
      tokens["H2O"] = "H2O" + ";" + "H2O" + ";" + "6";

      this.$store.commit("hrc20/tokens", tokens);
    },

    getHRC20Details(name) {
      if (this.hrc20[name] == undefined) {
        return ["HRC", "HRC", "0"];
      }

      return this.hrc20[name].split(";");
    },
  },
};
