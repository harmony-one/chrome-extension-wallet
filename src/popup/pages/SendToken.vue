<template>
  <div>
    <send-transaction :isToken="true" token="H20"></send-transaction>
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
