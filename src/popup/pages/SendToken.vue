<template>
  <div>
    <send-transaction isToken="true" token="H2O"></send-transaction>
  </div>
</template>

<script>
import SendTransaction from "../components/SendTransaction";

export default {
  name: "send-token",
  components: {
    SendTransaction
  }
};
</script>
