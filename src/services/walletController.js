class WalletController {
  constructor() {
    this.isOneWallet = true;
  }
  getAccount() {
    return new Promise((resolve, reject) => {
      try {
      } catch (e) {
        reject(e);
      }
    });
  }
}

const walletController = new WalletController();
export default walletController;
