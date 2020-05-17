<template>
  <modal
    name="approve-dialog"
    class="modal"
    transition="pop-out"
    :width="300"
    :focus-trap="true"
    :height="400"
  >
    <div class="modal-header">
      <span class="close" @click="reject">&times;</span>
      Approve Transaction
    </div>
    <div class="modal-body">
      <p>Sending</p>
      <div class="address-content">
        <div>
          <b>{{ minifyAddress(fromAddr) }}</b> of <b>{{ fromShard }}</b> Shard
          to
        </div>
        <div>
          <b>{{ minifyAddress(toAddr) }}</b> of <b>{{ toShard }}</b> Shard
        </div>
      </div>
      <div class="invoice-row">
        <div>Subtotal</div>
        <div>{{ getDisplayAmount(subTotal) }} ONE</div>
      </div>
      <div class="invoice-row">
        <div>Gas Fee</div>
        <div>{{ getDisplayAmount(gasFee) }} ONE</div>
      </div>
      <div class="invoice-divider"></div>
      <div class="invoice-row">
        <div>Total</div>
        <div>{{ getDisplayAmount(getTotal) }} ONE</div>
      </div>
      <div class="password-content">
        <label class="input-label">
          Password
          <input
            class="input-field"
            type="password"
            name="password"
            ref="password"
            v-model="password"
            placeholder="Input your password"
            v-on:keyup.enter="approve"
          />
          <div class="error" v-show="showError">Password is incorrect</div>
        </label>
      </div>
    </div>
    <div class="modal-footer">
      <button class="outline" @click="reject">Reject</button>
      <button @click="approve" :disabled="!password">Approve</button>
    </div>
  </modal>
</template>
<script>
import { mapState } from "vuex";
export default {
  data: () => ({
    password: "",
    showError: false,
  }),
  props: ["fromAddr", "toAddr", "subTotal", "gasFee", "fromShard", "toShard"],
  computed: {
    ...mapState(["wallet"]),
    getTotal() {
      return Number(this.subTotal) + Number(this.gasFee);
    },
  },
  methods: {
    showDialog() {
      this.showError = false;
      this.password = "";
      this.$modal.show("approve-dialog");
    },
    minifyAddress(str) {
      return str.slice(0, 20) + "...";
    },
    getDisplayAmount(num) {
      return Number(num).toFixed(6);
    },
    approve() {
      if (this.password !== this.wallet.keypass) this.showError = true;
      else {
        this.showError = false;
        this.$modal.hide("approve-dialog");
        this.$emit("confirmed");
      }
    },
    reject() {
      this.$modal.hide("approve-dialog");
    },
  },
};
</script>

<style>
.modal {
  -webkit-animation-name: animatetop;
  -webkit-animation-duration: 0.4s;
  animation-name: animatetop;
  animation-duration: 0.4s;
}
.address-content {
  margin-bottom: 1rem;
}
.error {
  color: red;
  font-size: 10px;
  margin-top: 5px;
}
.invoice-row {
  display: flex;
  justify-content: space-between;
}
.invoice-divider {
  margin-top: 5px;
  margin-bottom: 5px;
  width: 100%;
  border-top: 1px solid #bbb;
}
.password-content {
  margin-top: 30px;
  margin-bottom: 10px;
}
.modal-header {
  padding: 10px 16px;
  border-bottom: 1px solid #e0e0e0;
  height: 45px;
  font-weight: bold;
}

.modal-body {
  padding: 10px 15px 10px 15px;
  height: 310px;
  font-size: 13px;
}

.modal-footer {
  border-top: 1px solid #e0e0e0;
  height: 45px;
  padding-right: 15px;
  display: flex;
  justify-content: flex-end;
}
.close {
  color: black;
  float: right;
  font-size: 18px;
}
.close:hover,
.close:focus {
  color: #777777;
  text-decoration: none;
  cursor: pointer;
}
button {
  font-size: 13px;
  margin: 8px;
  font-weight: 400;
  min-width: 70px;
  color: white;
  border-radius: 0.3rem;
  cursor: pointer;
  background: #0a93eb;
  transition: all 0.5s ease;
  white-space: nowrap;
  outline: none;
  border: none;
}
button:hover,
button:focus {
  background-color: #0987d7;
}
button.outline {
  background: rgba(10, 147, 235, 0.05);
  border: 2px solid #0a93eb;
  color: black;
}
button:disabled {
  background: #e0e0e0;
  color: #888;
}
</style>
