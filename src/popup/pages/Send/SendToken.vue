<template>
  <div>
    <send-transaction :isToken="true" :token="token"></send-transaction>
  </div>
</template>

<script>
import SendTransaction from "./SendTransaction";
import _ from "lodash";
import token from "../../mixins/token";
export default {
  name: "send-token",
  data: () => ({
    token: null,
  }),
  mixins: [token],
  components: {
    SendTransaction,
  },
  created() {
    const address = this.$route.params.address;
    this.token = _.find(this.tokenArrayOfNetwork, { address });
  },
};
</script>
