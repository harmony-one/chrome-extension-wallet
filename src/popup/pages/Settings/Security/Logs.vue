<template>
  <div>
    <app-header subtitle="Security" backRoute="/settings" />
    <main class="main">
      <div
        class="list-item"
        @click="getLogs"
      >
      Download Logs
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { GET_LOGS } from '../../../../types';

export default {
  data() {
    return {
    };
  },
  components: {
  },
  methods: {
    getLogs() {
        console.log("Get logs")

        chrome.runtime.sendMessage(
            { action: GET_LOGS },
            async (state) => {
                var blob = new Blob([JSON.stringify(state, null, '\t')], {type: "application/json;charset=utf-8"});
                saveAs(blob, "logs.json");
            }
        );
    },
  },
};
</script>
<style></style>
