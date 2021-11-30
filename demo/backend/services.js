function parsePromised(json) {
  return new Promise(function(resolve, reject){
    try {
      const parsedJson = JSON.parse(json);
      resolve(parsedJson);
    } catch(error) {
      // we reach in this block if we encounter error while parsing some invalid given json
      reject(error);
      //or reject(error.message);
    }
  });
}

module.exports = (brambl) => {
  return {
    getHead: async () => brambl.requests.getLatestBlock(),

    getBalance: async (addr) =>
      brambl.requests.lookupBalancesByAddresses({ addresses: [addr] }),
    getAssetTotal: (balance_promise, assetCode, address) => {
      return balance_promise[address].Boxes.AssetBox.filter(obj => obj.value.assetCode === assetCode)
        .map(obj => parseInt(obj.value.quantity, 10))
        .reduce((prev, curr) => prev + curr);
    },
    generateAssetCode: async (name) => brambl.createAssetCode(name),

    mint: async (recipient, name, quantity, securityRoot, metadata) => {
      const _securityRoot = securityRoot || "11111111111111111111111111111111";
      const _metadata = metadata || `minted - ${new Date()}`;
      const params = {
        propositionType: "PublicKeyCurve25519",
        recipients: [[recipient, quantity, _securityRoot, _metadata]],
        assetCode: brambl.createAssetCode(name),
        sender: [brambl.keyManager.address],
        changeAddress: brambl.keyManager.address,
        consolidationAddress: brambl.keyManager.address,
        minting: true,
        fee: 100
      };

      return brambl.transaction("createRawAssetTransfer", params);
    },

    transfer: async (
      recipient,
      assetcode,
      quantity,
      securityRoot,
      metadata
    ) => {
      const _securityRoot = securityRoot || "11111111111111111111111111111111";
      const _metadata = metadata || `transferred - ${new Date()}`;
      const params = {
        propositionType: "PublicKeyCurve25519",
        recipients: [[recipient, quantity, _securityRoot, _metadata]],
        assetCode: assetcode,
        sender: [brambl.keyManager.address],
        changeAddress: brambl.keyManager.address,
        consolidationAddress: brambl.keyManager.address,
        minting: false,
        fee: 100
      };

      return brambl.transaction("createRawAssetTransfer", params);
    }
  };
};
