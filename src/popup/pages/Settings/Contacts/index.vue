<template>
  <div>
    <app-header subtitle="Contacts" backRoute="/settings" />
    <main class="main contact-page">
      <div class="contact-header">
        <button class="contact-but" @click="showAddModal">Add</button>
        <div class="import-header">
          <button class="contact-but" @click="importContact">Import</button>
          <button class="contact-but" @click="exportContact">Export</button>
        </div>
      </div>
      <div class="contact-body">
        <div v-for="item in contacts" :key="item.address">
          <ContactItem
            :name="item.name"
            :address="item.address"
            :onEdit="() => editContact(item)"
            :onDelete="() => deleteContact(item)"
          />
        </div>
      </div>
      <modal
        name="modal-contact-add"
        :adaptive="true"
        transition="scale"
        :width="250"
        height="auto"
      >
        <div class="modal-header">Add the Contact</div>
        <div class="modal-body">
          <input type="text" name="name" v-model="newName" placeholder="Input the name" />
          <input type="text" name="address" v-model="newAddress" placeholder="Input the address" />
        </div>
        <div class="modal-footer">
          <div class="secondary" @click="$modal.hide('modal-contact-add')">CLOSE</div>
          <div class="primary" @click="addContact">ADD</div>
        </div>
      </modal>
      <modal
        name="modal-contact-edit"
        :adaptive="true"
        transition="scale"
        :width="250"
        height="auto"
      >
        <div class="modal-header">Edit the Contact</div>
        <div class="modal-body">
          <input type="text" name="name" v-model="newName" placeholder="Input the name" />
          <input type="text" name="address" v-model="newAddress" placeholder="Input the address" />
        </div>
        <div class="modal-footer">
          <div class="secondary" @click="$modal.hide('modal-contact-edit')">CLOSE</div>
          <div class="primary" @click="saveContact">SAVE</div>
        </div>
      </modal>
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import ContactItem from "./ContactItem";
export default {
  data: () => ({
    newName: "",
    newAddress: "",
  }),
  components: {
    ContactItem,
  },
  computed: {
    ...mapState({
      contacts: (state) => state.settings.contacts,
    }),
  },
  methods: {
    editContact(item) {
      this.newName = item.name;
      this.newAddress = item.address;
      this.$modal.show("modal-contact-edit");
    },
    saveContact() {
      this.$modal.hide("modal-contact-edit");
      this.$store.dispatch("settings/editContact", {
        name: this.newName,
        address: this.newAddress,
      });
      this.newName = "";
      this.newAddress = "";
    },
    deleteContact(item) {
      this.$modal.show("dialog", {
        text: "Are you sure you want to delete this contact?",
        buttons: [
          {
            title: "Cancel",
            default: true,
            handler: () => {
              this.$modal.hide("dialog");
            },
          },
          {
            title: "Delete",
            handler: () => {
              this.$modal.hide("dialog");
              this.$store.dispatch("settings/deleteContact", { ...item });
            },
          },
        ],
      });
    },
    showAddModal() {
      this.$modal.show("modal-contact-add");
    },
    addContact() {
      this.$modal.hide("modal-contact-add");
      this.$store.dispatch("settings/addContact", {
        name: this.newName,
        address: this.newAddress,
      });
      this.newName = "";
      this.newAddress = "";
    },
    importContact() {},
    exportContact() {},
  },
};
</script>
<style>
.contact-but {
  padding: 5px;
}
.contact-body {
  height: 460px;
  overflow: auto;
  margin: 0 -1rem -1rem -1rem;
  padding: 0 1rem 1rem 1rem;
}
.contact-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>
