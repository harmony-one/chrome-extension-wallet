import axios from "axios";
import { Harmony } from "@harmony-js/core";
import { ChainID, ChainType } from "@harmony-js/utils";

const hmy = new Harmony("https://api.s0.t.hmny.io", {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyMainnet,
});
function contract(abi, to) {
  let contract = hmy.contracts.createContract(abi, to);
  let decodeParameters = (abi, hexdata) => {
    if (0 === abi.length) return [];
    let params = contract.abiCoder.decodeParameters(abi, hexdata);
    params.length = abi.length;
    return Array.from(params);
  };
  for (let name in contract.abiModel.getMethods()) {
    let method = contract.abiModel.getMethod(name);
    method.decodeInputs = (hexData) => decodeParameters(method.inputs, hexData);
    method.decodeOutputs = (hexData) =>
      decodeParameters(method.outputs, hexData);
  }

  contract.decodeInput = (hexData) => {
    const no0x = hexData.startsWith("0x") ? hexData.slice(2) : hexData;
    console.log("hexData", hexData);
    const sig = no0x.slice(0, 8).toLowerCase();
    console.log("sig", sig);
    const method = contract.abiModel.getMethod("0x" + sig);
    console.log("method", method);
    if (!method) {
      return false;
    }

    const argv = method.decodeInputs("0x" + no0x.slice(8));
    console.log("argv", argv);
    console.log("contract.methods", contract.methods);
    const obj = contract.methods["0x" + sig](...argv);
    console.log("obj", obj);

    for (let i = 0; i < obj.params.length; i++) {
      if (obj.abiItem.inputs[i].type === "address") {
        obj.params[i] = hmySDK.crypto.toBech32(obj.params[i]);
      } else if (obj.abiItem.inputs[i].type === "address[]") {
        obj.params[i] = obj.params[i].map((a) => hmySDK.crypto.toBech32(a));
      }
    }

    obj.toString = () => {
      let str = obj.abiItem.name + "(";
      for (let i = 0; i < obj.params.length; i++) {
        if (i > 0) str += ", ";
        str += obj.params[i];
      }
      str += ")";
      return str;
    };
    return obj;
  };

  return contract;
}

export const fetchSuggestions = (hexData) => {
  const sig = hexData.slice(0, 10).toLowerCase();
  console.log(sig);
  return (
    axios
      .get(
        `https://www.4byte.directory/api/v1/signatures/?hex_signature=${sig}`
      )
      .then((res) => {
        return res.data.results;
      })
      // sort as first-in seem more relevant
      .then((res) => res.sort((a, b) => a.id - b.id))
      .then((res) => {
        // limit to 10
        if (res.length > 10) {
          res.length = 10;
        }
        console.log(res);

        return res
          .map((r) => createABI(hexData, r.text_signature))
          .filter((res) => !!res);
      })
      .catch((err) => {
        console.error(err);
        return null;
      })
  );
};

const createABI = (hexData, stringSignature) => {
  const name = stringSignature.split("(")[0];
  const s = stringSignature.split("(")[1].split(")")[0];
  const inputs = s.split(",");

  const abi = [
    {
      constant: true,
      inputs: inputs
        .filter((i) => !!i)
        .map((v, i) => ({ type: v, name: "$" + (i + 1) })),
      name: name,
      outputs: [],
      type: "function",
      payable: false,
    },
  ];
  console.log(abi);

  return getParams(hexData, abi);
};

const getParams = (hexData, abi) => {
  const sig = hexData.slice(0, 10).toLowerCase();
  const contractWithHelpers = contract(abi);
  console.log(contractWithHelpers);
  const method = contractWithHelpers.abiModel.getMethod(sig);
  console.log("method", method);

  if (!method) {
    console.log("false");
    return false;
  }

  try {
    const inputValues = contractWithHelpers.decodeInput(hexData);
    console.log("inputValues=>", inputValues);
    const outputValues = method.decodeOutputs(hexData);
    console.log("outputValues=>", outputValues);

    const inputs = method.inputs.map((o, i) => ({
      name: o.name,
      type: o.type,
      value: inputValues.params[i],
    }));
    console.log("inputs=>", inputs);
    const outputs = method.outputs.map((o, i) => ({
      name: o.name,
      type: o.type,
      value: outputValues[i],
    }));
    console.log("outputs=>", outputs);

    return { method, inputs, outputs };
  } catch (e) {
    return false;
  }
};
