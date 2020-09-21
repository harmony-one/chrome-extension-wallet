<template>
  <div>
    <app-header subtitle="Contacts" backRoute="/settings" />
    <main class="main contact-page">
      <div class="contact-header">
        <button class="primary contact-but" @click="showAddModal">Add</button>
        <div class="import-header">
          <button class="primary contact-but" @click="importContact">
            Import
          </button>
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
        <div class="modal-header">Add the Contact</div>
        <div class="modal-body">
          <input
            type="text"
            name="name"
            v-model="newName"
            ref="addName"
            placeholder="Input the name"
          />
          <input
            type="text"
            name="address"
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
            v-model="newName"
            ref="editName"
            placeholder="Input the name"
          />
          <input
            type="text"
            name="address"
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
import { HarmonyAddress } from "@harmony-js/crypto";
export default {
  data: () => ({
    editIndex: -1,
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
        if (!HarmonyAddress.isValidBech32(this.newAddress)) {
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
    importContact() {},
    exportContact() {},
  },
};
</script>
<style scoped>
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
.modal-body > input:last-child {
  font-size: 11px;
}
</style>
