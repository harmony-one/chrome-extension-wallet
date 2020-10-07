<template>
  <div class="contact-select" v-click-outside="hideList">
    <div class="contact-search">
      <input
        class="contact-search-input"
        type="text"
        name="recipient"
        ref="recipient"
        placeholder="Select the recipient"
        v-model="recipient"
        @input="onInput"
        v-on:keyup.capture="onKeyUp"
        v-on:keydown.capture="onKeyDown"
        @focusin.stop="showList"
        @blur="onBlur"
      />
      <div
        class="dropdown_indicator"
        :class="{ active: listVisible }"
        @click="toggleList"
      >
        <div class="dropdown-indicator-svg"></div>
      </div>
    </div>
    <div
      v-show="filteredContacts.length && listVisible"
      class="contact-select-list"
      ref="contact-select-list"
      v-on:keyup.capture="onKeyUp"
      v-on:keydown.capture="onKeyDown"
    >
      <div
        class="contact-select-item"
        v-for="(item, index) in filteredContacts"
        :key="index"
        :class="{ active: index === searchedIndex }"
        @mouseover.prevent="onItemOver(index)"
        @click="selectItem($event, item)"
      >
        <span>{{ item.name }}</span>
        <span>{{ item.address }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "ContactSelect",
  props: ["onSelected", "value"],
  data: () => ({
    recipient: "",
    searchedIndex: -1,
    listVisible: false,
    filteredContacts: [],
    keyPressed: false,
  }),
  computed: {
    ...mapState({
      contacts: (state) => state.settings.contacts,
    }),
  },
  mounted() {
    this.filteredContacts = this.contacts;
    if (this.value && this.value.address) this.recipient = this.value.address;
  },
  watch: {
    recipient() {
      this.filteredContacts = this.contacts.filter((elem) => {
        return (
          elem.name.toLowerCase().includes(this.recipient.toLowerCase()) ||
          elem.address.toLowerCase().includes(this.recipient.toLowerCase())
        );
      });
      if (!this.filteredContacts.length) this.searchedIndex = -1;
      else this.searchedIndex = 0;
    },
  },
  methods: {
    onInput(event) {
      this.listVisible = true;
    },
    showList() {
      this.listVisible = true;
    },
    toggleList(e) {
      e.preventDefault();
      this.listVisible = !this.listVisible;
      if (this.listVisible) this.$refs.recipient.focus();
    },
    onBlur(e) {
      this.onSelected(this.recipient);
    },
    hideList() {
      this.listVisible = false;
    },
    onItemOver(index) {
      if (!this.keyPressed) this.searchedIndex = index;
    },
    onKeyUp(e) {
      this.keyPressed = false;
    },
    onKeyDown(e) {
      this.keyPressed = true;
      const offset =
        this.$refs["contact-select-list"].scrollHeight /
        this.filteredContacts.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.searchedIndex =
          (this.searchedIndex + 1) % this.filteredContacts.length;
        this.$nextTick(() => {
          if (this.searchedIndex === 0)
            this.$refs["contact-select-list"].scrollTop = 0;
          else if (
            (this.searchedIndex + 1) * offset >
            this.$refs["contact-select-list"].scrollTop +
              this.$refs["contact-select-list"].clientHeight
          ) {
            this.$refs["contact-select-list"].scrollTop = Math.min(
              this.$refs["contact-select-list"].scrollTop + offset,
              this.$refs["contact-select-list"].scrollHeight
            );
          }
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.searchedIndex =
          this.searchedIndex < 0
            ? this.filteredContacts.length - 1
            : (this.searchedIndex + (this.filteredContacts.length - 1)) %
              this.filteredContacts.length;
        this.$nextTick(() => {
          if (this.searchedIndex === this.filteredContacts.length - 1)
            this.$refs["contact-select-list"].scrollTop = this.$refs[
              "contact-select-list"
            ].scrollHeight;
          else if (
            this.searchedIndex * offset <
            this.$refs["contact-select-list"].scrollTop
          )
            this.$refs["contact-select-list"].scrollTop = Math.max(
              this.$refs["contact-select-list"].scrollTop - offset,
              0
            );
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        this.recipient = this.filteredContacts[this.searchedIndex].address;
        this.onSelected(this.recipient);
        this.hideList();
        this.$refs.recipient.blur();
      }
    },
    selectItem(event, item) {
      event.preventDefault();
      this.recipient = item.address;
      this.onSelected(this.recipient);
      this.hideList();
      this.$refs.recipient.blur();
    },
  },
};
</script>
<style lang="scss" scoped>
.contact-select {
  position: relative;
}
.contact-select-list {
  position: absolute;
  top: 100%;
  z-index: 100;
  background: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  max-height: 200px;
  overflow: auto;
  width: 100%;
}
.contact-search {
  display: flex;
  width: 100%;
  margin: 0.25rem 0;
  padding: 0.75rem;
  border-radius: 3px;
  box-shadow: inset 0 0 3px #eeeeee;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  color: #424242;
  font-size: 0.75rem;
  outline: 0;
  -webkit-appearance: none;
  &::placeholder {
    color: #9e9e9e;
  }
  .contact-search-input {
    padding: 0 28px 0 0;
    width: 100%;
    border: none;
    outline: 0;
  }
  .dropdown_indicator {
    line-height: 16px;
    position: absolute;
    box-sizing: border-box;
    width: 40px;
    height: 38px;
    right: 1px;
    top: 1px;
    display: flex;
    place-items: center;
    place-content: center;
    padding: 4px 8px;
    margin: 0;
    text-decoration: none;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s ease;

    .dropdown-indicator-svg {
      height: 6px;
      width: 8px;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='32' height='24' viewBox='0 0 32 24'><polygon points='0,0 32,0 16,24' style='fill: rgb%2896, 125, 139%29'></polygon></svg>");
      background-origin: content-box;
      background-position: right 0 center;
      background-repeat: no-repeat;
      background-size: 8px 6px;
      cursor: pointer;
    }
    &.active {
      transform: rotateZ(180deg);
    }
  }
}
.contact-select-item {
  display: flex;
  flex-direction: column;
  padding: 4px;
  justify-content: space-between;
  & > span:first-child {
    font-size: 12px;
    color: black;
  }
  & > span:last-child {
    font-size: 9px;
    color: #888;
  }
  &.active {
    background: #0a93eb;
    span {
      color: white !important;
    }
  }
}
@keyframes spinning {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(2turn);
  }
}
</style>
