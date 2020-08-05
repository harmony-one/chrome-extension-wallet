<template>
  <div>
    <send-transaction></send-transaction>
  </div>
</template>

<script>
import SendTransaction from "./SendTransaction";

export default {
  name: "send",
  components: {
    SendTransaction,
  },
};
</script>
