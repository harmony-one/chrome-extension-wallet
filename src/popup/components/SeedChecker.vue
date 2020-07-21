<template>
  <div>
    <div class="caption-header">
      <div v-if="isMatched">
        <h4>You've matched the Seed Phrase successfully</h4>
      </div>
      <div v-else>
        <h4>Please select the seeds in Sequence Order</h4>
      </div>
      <button class="clear-but" v-if="!isMatched" @click="clearPhrase">Clear</button>
    </div>
    <div class="confirm-seed-box">
      <div
        class="input-seed-box"
        v-for="(item, index) in shuffledPhrase"
        :key="index"
      >{{getConfirmSeedText(index)}}</div>
    </div>
    <div class="seed-button-box">
      <button
        v-for="(item, index) in shuffledPhrase"
        :key="index"
        :disabled="isSelected(index)"
        class="outline seed-button"
        @click="clickPhrase(index)"
      >{{item}}</button>
      <button class="full-but" :disabled="!isMatched" @click="confirm">Create Account</button>
    </div>
  </div>
</template>
<script>
export default {
  name: "seed-check",
  data: () => ({
    confirmPhrase: [],
    shuffledPhrase: [],
    selectedFlag: []
  }),
  props: {
    phrase: {
      type: String
    },
    confirm: {
      type: Function
    }
  },
  computed: {
    isMatched() {
      const confirmStr = this.confirmPhrase.join(" ");
      return confirmStr === this.phrase;
    }
  },
  methods: {
    isSelected(index) {
      return this.selectedFlag[index];
    },
    clickPhrase(index) {
      this.confirmPhrase.push(this.shuffledPhrase[index]);
      this.selectedFlag[index] = true;
    },
    clearPhrase() {
      this.confirmPhrase = [];
      this.selectedFlag.fill(false);
    },
    getConfirmSeedText(index) {
      const seedText = this.confirmPhrase[index];
      return seedText ? seedText : "";
    },
    shuffleSeed() {
      let phraseArray = this.phrase.split(" ");
      for (let i = phraseArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [phraseArray[i], phraseArray[j]] = [phraseArray[j], phraseArray[i]];
      }
      this.shuffledPhrase = phraseArray;
    }
  },
  mounted() {
    this.shuffleSeed();
    this.selectedFlag = new Array(12).fill(false);
  }
};
</script>
<style lang="scss">
.clear-but {
  height: 40px;
}
.full-but {
  margin-top: 20px;
  height: 40px;
  width: 100%;
}
.caption-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  h4 {
    margin: auto;
  }
}
.seed-button-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.seed-button-box button {
  margin-bottom: 10px;
}
.seed-button {
  width: 30%;
  border-color: #0a93eb;
  color: #4d4b5a;
  background: none;
}
.confirm-seed-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 30px;
}
.input-seed-box {
  border: none;
  background: none;
  font-size: 1rem;
  width: 100px;
  height: 25px;
  text-align: center;
  border-bottom: 2px solid #666;
  margin-bottom: 5px;
}
</style>
