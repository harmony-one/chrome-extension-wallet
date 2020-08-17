<template>
  <div>
    <send-transaction :isToken="true" :token="$route.params.symbol"></send-transaction>
  </div>
</template>

<script>
import SendTransaction from "../components/SendTransaction";

export default {
  name: "send-token",
  props: ["symbol"],
  components: {
    SendTransaction
  }
};
</script>
