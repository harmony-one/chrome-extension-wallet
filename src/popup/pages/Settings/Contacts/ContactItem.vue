<template>
  <div class="contact-item">
    <div class="contact-item-content">
      <div>{{ name }}</div>
      <div>{{ address }}</div>
    </div>
    <div class="but_more" @click="showMenu" v-click-outside="hideMenu">
      <i class="material-icons">more_vert</i>
      <div class="contact-menu" v-show="menuOpen">
        <div class="contact-menu-item" @click="onEdit(address)">Edit</div>
        <div class="contact-menu-item" @click="onDelete(address)">Delete</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: {
    name: String,
    address: String,
    onEdit: Function,
    onDelete: Function,
  },
  data: () => ({
    menuOpen: false,
  }),
  methods: {
    showMenu() {
      this.menuOpen = !this.menuOpen;
    },
    hideMenu() {
      this.menuOpen = false;
    },
  },
};
</script>
<style lang="scss">
.but_more {
  display: flex;
  position: relative;
  border-radius: 5px;
  cursor: pointer;
  i {
    font-size: 25px !important;
  }
}
.contact-item {
  display: flex;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: #ffffff;
  border-radius: 5px;
  padding: 17px 10px 17px 20px;
  margin-bottom: 10px;
  align-items: center;
  color: black;
  .contact-item-content {
    & > div:first-child {
      font-size: 16px;
    }
    & > div:last-child {
      color: #aaa;
      font-size: 11px;
    }
  }
}
.contact-menu {
  position: absolute;
  right: 10px;
  top: 28px;
  font-size: 12px;
  border-bottom: none;
  z-index: 100;
  box-shadow: 1px 3px 6px #00000055;
  .contact-menu-item {
    padding: 5px 10px 5px 10px;
    background: white;
    color: black;
    &:hover,
    &:focus {
      background: #ddd;
    }
    &:active {
      background: #ccc;
    }
  }
}
</style>
