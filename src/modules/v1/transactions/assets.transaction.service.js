const BramblHelper = require("../../../lib/bramblHelper");
const stdError = require("../../../core/standardError");
const Constants = require("../../../util/constants");
const transactionsServiceHelper = require("./transactionsServiceHelper");

const serviceName = "AssetTransaction";

class AssetTransactionService {
  static async assetTransferHelper(bramblHelper, args) {
    return bramblHelper.sendRawAssetTransaction(args).then(function(value) {
      if (value.error) {
        return value;
      } else {
        return transactionsServiceHelper.signAndSendTransactionWithStateManagement(
          value,
          bramblHelper,
          args
        );
      }
    });
  }

  static async createAsset(args) {
    const bramblHelper = new BramblHelper(
      false,
      args.password,
      args.network,
      args.keyFilePath
    );
    args.address = bramblHelper.brambljs.keyManager.address;
    if (bramblHelper) {
      // iterate through all sender, recipient, and change addresses checking whether or not they are in the DB
      args.addresses = await transactionsServiceHelper.addAddressesToDBFromTransaction(
        bramblHelper,
        args
      );
      var assetCode = bramblHelper.createAssetValue(args.name);
      args.assetCode = assetCode;
      args.address = bramblHelper.brambljs.keyManager.address;
      return AssetTransactionService.assetTransferHelper(bramblHelper, args);
    } else {
      throw stdError(
        404,
        "Missing or Invalid KeyfilePath",
        serviceName,
        serviceName
      );
    }
  }

  static async updateAsset(args) {
    const bramblHelper = new BramblHelper(
      false,
      args.password,
      args.network,
      args.keyFilePath
    );
    if (bramblHelper) {
      if (args.assetCode) {
        args.minting = false;
        args.address = bramblHelper.brambljs.keyManager.address;
        // iterate through all sender, recipient, and change addresses checking whether or not they are in the db
        args.addresses = await transactionsServiceHelper.addAddressesToDBFromTransaction(
          bramblHelper,
          args
        );
        return AssetTransactionService.assetTransferHelper(bramblHelper, args);
      } else {
        throw stdError(
          404,
          "Missing or Invalid Asset Code",
          serviceName,
          serviceName
        );
      }
    }
  }

  static async burnAsset(args) {
    const bramblHelper = new BramblHelper(
      false,
      args.password,
      args.network,
      args.keyFilePath
    );
    if (bramblHelper) {
      if (args.assetCode) {
        args.recipients = [[Constants.BURNER_ADDRESS, args.quantity]];
        args.minting = false;
        args.address = bramblHelper.brambljs.keyManager.address;
        args.addresses = await transactionsServiceHelper.addAddressesToDBFromTransaction(
          bramblHelper,
          args
        );
        return AssetTransactionService.assetTransferHelper(bramblHelper, args);
      } else {
        throw stdError(
          400,
          "Unable to create transaction, please double check your request.",
          serviceName,
          serviceName
        );
      }
    }
  }
}

module.exports = AssetTransactionService;
