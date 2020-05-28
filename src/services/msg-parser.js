import BigNumber from "bignumber.js"

export const parseMessageObject = (messageString) => {
  const signMessage = JSON.parse(messageString);

  const result = {};

  const msg = signMessage.msgs[0];

  const msgType = msg.type.split('/')[1];

  switch(msgType) {
    case "MsgSend":
      result.type = "Send";
      result.receiverAddress = msg.value.to_address;
      result.targetAddress = result.receiverAddress;
      result.subtotal = Number.parseInt(msg.value.amount[0].amount, 10);
      break;

    case "MsgDelegate":
      result.type = "Delegate";

      result.receiverAddress = msg.value.validator_address;
      result.targetAddress = result.receiverAddress;

      result.delegator_address = msg.value.delegator_address;
      result.validator_address = msg.value.validator_address;

      result.subtotal = Number.parseInt(msg.value.amount.amount, 10);
      break;

    case "MsgUndelegate":
      result.type = "Undelegate";

      result.receiverAddress = msg.value.validator_address;
      result.targetAddress = result.receiverAddress;

      result.delegator_address = msg.value.delegator_address;
      result.validator_address = msg.value.validator_address;

      result.subtotal = Number.parseInt(msg.value.amount.amount, 10);
      break;

    case "MsgWithdrawDelegationReward":
      result.type = "WithdrawDelegationReward";

      result.receiverAddress = msg.value.delegator_address;
      result.targetAddress = result.receiverAddress;

      result.delegator_address = msg.value.delegator_address;
      result.validator_address = msg.value.validator_address;

      result.subtotal = BigNumber(msg.value.amount).toNumber();

      break;
  }

  result.fee = Number(signMessage.fee.amount[0].amount);
  result.gas = Number(signMessage.fee.gas);
  result.total = Number(result.subtotal + result.gas);

  // this.nonce = Number.parseInt(signMessage.nonce, 10);

  result.network = signMessage.network;

  return result;
}


// Sign message example
// const exampleRequest = {
//   account_number: '22147',
//   chain_id: 'cosmoshub-2',
//   fee: {
//     amount: [
//       {
//         amount: '912',
//         denom: 'uatom'
//       }
//     ],
//     gas: '36497'
//   },
//   memo: '(Sent via Lunie)',
//   msgs: [
//     {
//       type: 'cosmos-sdk/MsgSend',
//       value: {
//         amount: [
//           {
//             amount: '10000',
//             denom: 'uatom'
//           }
//         ],
//         from_address: 'cosmos1r5fknqx36n8vts9wlqufw08u3fh3qklhfwvhg5',
//         to_address: 'cosmos1gr2nqfwan6y9y89clr6cr8hnjmdxagm5rpdsgu'
//       }
//     }
//   ],
//   sequence: '0'
// };


// {
//   "account_number":"0",
//   "chain_id":2,
//   "fee":{
//   "amount":[
//     {
//       "amount":"24",
//       "denom":"one"
//     }
//   ],
//     "gas":"24341"
// },
//   "memo":"",
//   "msgs":[
//   {
//     "type":"cosmos-sdk/MsgDelegate",
//     "value":{
//       "amount":{
//         "amount":"100000",
//         "denom":"one"
//       },
//       "delegator_address":"one18n8e7472pg5fqvcfcr5hg0npquha24wsxmjheg",
//       "validator_address":"cosmosvaloper1grgelyng2v6v3t8z87wu3sxgt9m5s03xfytvz7"
//     }
//   }
// ],
//   "sequence":"0"
// }

// {
//   "account_number":"0",
//   "chain_id":2,
//   "fee":{
//   "amount":[
//
//   ],
//     "gas":"24341"
// },
//   "memo":"",
//   "msgs":[
//   {
//     "type":"cosmos-sdk/MsgUndelegate",
//     "value":{
//       "amount":{
//         "amount":"1000000",
//         "denom":"one"
//       },
//       "delegator_address":"one1pdv9lrdwl0rg5vglh4xtyrv3wjk3wsqket7zxy",
//       "validator_address":"one1pdv9lrdwl0rg5vglh4xtyrv3wjk3wsqket7zxy"
//     }
//   }
// ],
//   "sequence":"0"
// }
