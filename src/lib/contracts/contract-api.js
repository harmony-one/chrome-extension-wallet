export const getContractInstance = (hmy, artifact) => {
  const contract = hmy.contracts.createContract(
    artifact.abi,
    artifact.networks[net]
      ? artifact.networks[net].address
      : config[artifact.contractName]
  );
  console.log(artifact.abi);
  return contract;
};
export const txContractMethod = (contract, method, ...args) =>
  new Promise((resolve, reject) => {
    let hash, receipt, error; //assigned in listener
    const done = () =>
      resolve({
        hash,
        receipt,
        error,
      });
    console.log("getContractMethod args", ...args);
    const tx = contract.methods[method](...args)
      .send({
        gasLimit,
        gasPrice,
      })
      .on("transactionHash", (_hash) => {
        hash = _hash;
        console.log(hash);
      })
      .on("receipt", (_receipt) => {
        receipt = _receipt;
        console.log(receipt);
      })
      .on("confirmation", (confirmationNumber, receipt) => {
        done();
      })
      .on("error", (_error) => {
        error = _error;
        done();
      });
  });
