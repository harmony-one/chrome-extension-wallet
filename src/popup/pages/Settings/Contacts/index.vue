<template>
  <div>
    <app-header subtitle="Contacts" backRoute="/settings" />
    <main class="main contact-page">
      <div class="contact-header">
        <button class="primary contact-but" @click="showAddModal">Add</button>
        <div class="import-header">
          <label for="importcontact" class="file-label">Import</label>
          <input
            type="file"
            id="importcontact"
            name="importcontact"
            class="file-input"
            @click="(e) => (e.target.value = null)"
            @change="importContact"
          />
          <button class="primary contact-but" @click="exportContact">
            Export
          </button>
        </div>
      </div>
      <div class="contact-body">
        <div v-if="!contacts.length" class="center-container">
          <span>No contacts available</span>
        </div>
        <div v-for="(item, index) in contacts" :key="index">
          <ContactItem
            :name="item.name"
            :address="item.address"
            :onEdit="() => editContact(index, item)"
            :onDelete="() => deleteContact(index, item)"
          />
        </div>
      </div>
      <modal
        name="modal-contact-add"
        :adaptive="true"
        transition="scale"
        :width="330"
        height="auto"
      >
        <div class="modal-header">Add a contact</div>
        <div class="modal-body">
          <input
            type="text"
            name="name"
            class="modal-input-name"
            v-model="newName"
            ref="addName"
            placeholder="Input the name"
          />
          <input
            type="text"
            name="address"
            class="modal-input-address"
            v-model="newAddress"
            ref="addAddress"
            placeholder="Input the address"
          />
        </div>
        <div class="modal-footer">
          <div class="secondary" @click="$modal.hide('modal-contact-add')">
            CLOSE
          </div>
          <div
            class="primary"
            @click="addContact"
            :class="{ disabled: !newName || !newAddress }"
          >
            ADD
          </div>
        </div>
      </modal>
      <modal
        name="modal-contact-edit"
        :adaptive="true"
        transition="scale"
        :width="330"
        height="auto"
      >
        <div class="modal-header">Edit the Contact</div>
        <div class="modal-body">
          <input
            type="text"
            name="name"
            class="modal-input-name"
            v-model="newName"
            ref="editName"
            placeholder="Input the name"
          />
          <input
            type="text"
            name="address"
            class="modal-input-address"
            v-model="newAddress"
            ref="editAddress"
            placeholder="Input the address"
          />
        </div>
        <div class="modal-footer">
          <div class="secondary" @click="$modal.hide('modal-contact-edit')">
            CLOSE
          </div>
          <div
            class="primary"
            @click="saveContact"
            :class="{ disabled: !newName || !newAddress }"
          >
            SAVE
          </div>
        </div>
      </modal>
      <notifications
        group="notify"
        width="250"
        :max="4"
        class="notifiaction-container"
      />
    </main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import ContactItem from "./ContactItem";
import { isValidAddress } from "@harmony-js/utils";
import { saveAs } from "file-saver";
import _ from "lodash";
export default {
  data: () => ({
    editIndex: -1,
    newName: "",
    newContacts: [],
    newAddress: "",
    file: null,
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
    editContact(index, item) {
      this.editIndex = index;
      this.newName = item.name;
      this.newAddress = item.address;
      this.$modal.show("modal-contact-edit");
    },
    saveContact() {
      if (!this.isValidContact()) return;
      this.$modal.hide("modal-contact-edit");
      this.$store.dispatch("settings/editContact", {
        index: this.editIndex,
        name: this.newName,
        address: this.newAddress,
      });
    },
    deleteContact(index, item) {
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
              this.$store.dispatch("settings/deleteContact", index);
            },
          },
        ],
      });
    },
    showAddModal() {
      this.editIndex = -1;
      this.newName = "";
      this.newAddress = "";
      this.$modal.show("modal-contact-add");
    },
    renameIfExist(newName) {
      const findContactbyName = _.find(this.contacts, { name: newName });
      if (!findContactbyName) return newName;
      return this.renameIfExist(newName + " (2)");
    },
    isValidContact() {
      try {
        if (!isValidAddress(this.newAddress)) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Address is not valid",
          });
          return false;
        }
        const findContactIndexbyAddress = _.findIndex(this.contacts, {
          address: this.newAddress,
        });
        if (
          findContactIndexbyAddress > 0 &&
          findContactIndexbyAddress !== this.editIndex
        ) {
          this.$notify({
            group: "notify",
            type: "error",
            text: "Contact is already added",
          });
          return false;
        }
        this.newName = this.renameIfExist(this.newName);
        return true;
      } catch (err) {
        this.$notify({
          group: "notify",
          type: "error",
          text: err.message,
        });
        return false;
      }
    },
    addContact() {
      if (!this.isValidContact()) return;
      this.$modal.hide("modal-contact-add");
      this.$store.dispatch("settings/addContact", {
        name: this.newName,
        address: this.newAddress,
      });
    },
    async importContact(event) {
      this.file = event.target.files[0];
      if (!this.file) {
        this.$notify({
          group: "notify",
          type: "error",
          text: "Please select the contact file",
        });
        return;
      }
      this.$store.commit("loading", true);

      const _this = this;
      await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            _this.newContacts = JSON.parse(e.target.result);
            resolve();
          } catch (error) {
            this.$notify({
              group: "notify",
              type: "error",
              text: "Contact file is invalid",
            });
            this.$store.commit("loading", false);
            return;
          }
        };
        reader.readAsText(this.file);
      });

      try {
        this.newContacts.forEach(async (contact) => {
          if (!contact.name || !contact.address) {
            this.$notify({
              group: "notify",
              type: "error",
              text: "Contact file is invalid",
            });
            this.$store.commit("loading", false);
            return;
          }
          const findContactbyAddress = _.find(this.contacts, {
            address: contact.address,
          });
          if (!findContactbyAddress) {
            const newContact = {
              name: this.renameIfExist(contact.name),
              address: contact.address,
            };
            this.$store.dispatch("settings/addContact", newContact);
          }
        });
      } catch (err) {
        this.$notify({
          group: "notify",
          type: "error",
          text: err.message,
        });
        this.$store.commit("loading", false);
        return;
      }
      this.$store.commit("loading", false);
    },
    exportContact() {
      var file = new File([JSON.stringify(this.contacts)], "harmony.hcf", {
        type: "text/plain;charset=utf-8",
      });
      saveAs(file);
    },
  },
};
</script>
<style lang="scss" scoped>
.contact-but {
  padding: 5px;
}
.contact-body {
  position: relative;
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
.file-label {
  text-align: center;
  font-size: 13px;
  padding: 4px 10px;
  font-weight: 400;
  min-width: 60px;
  color: white;
  border-radius: 0.3rem;
  cursor: pointer;
  background: #0a93eb;
  white-space: nowrap;
  outline: none;
  border: 2px solid #0a93eb;
  &:hover {
    background-color: #0987d7;
  }
  &:active {
    background-color: #1f6bb7;
  }
  &:disabled {
    background: #e0e0e0;
    border: 2px solid #e0e0e0;
    color: #888;
  }
}

.file-input {
  opacity: 0;
  position: absolute;
  z-index: -1;
}
</style>
