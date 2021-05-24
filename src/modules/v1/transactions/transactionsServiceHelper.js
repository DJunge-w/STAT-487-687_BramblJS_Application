const { checkExistsByAddress } = require("../../../lib/validation");
const Address = require("../addresses/addresses.model");
const AddressesService = require("../addresses/addresses.service");
const ReadTransactionService = require("./read.transactions.service");
const stdError = require("../../../core/standardError");
const BramblJS = require("brambljs");

class TransactionServiceHelper {
  static async addAddressesToDBFromTransaction(bramblHelper, args) {
    // iterate through all sender, recipient, and change addresses, checking whether or not they are in the DB
    if (bramblHelper) {
      await args.addresses.forEach(address => {
        checkExistsByAddress(Address, address).then(function(result) {
          if (result.error) {
            return AddressesService.create({
              network: args.network,
              password: args.password,
              name: args.name,
              userEmail: args.userEmail,
              address: address
            });
          }
        });
      });
      return args.addresses;
    }
  }

  static async extractParamsAndAddAddressesToDb(
    bramblHelper,
    args,
    serviceName
  ) {
    const bramblParams = await bramblHelper.verifyRawTransactionData(args);
    const addresses = BramblJS.utils.extractAddressesFromObj(bramblParams);
    bramblParams.addresses = addresses;
    await TransactionServiceHelper.addAddressesToDBFromTransaction(
      bramblHelper,
      bramblParams
    ).then(function(result) {
      if (result.error) {
        throw stdError(500, result.error, serviceName, serviceName);
      } else {
        return result;
      }
    });
    return bramblParams;
  }

  static async signAndSendTransactionWithStateManagement(
    rawTransaction,
    bramblHelper,
    args
  ) {
    let obj = {};
    return (
      bramblHelper
        .signAndSendTransaction(rawTransaction)
        // eslint-disable-next-line no-unused-vars
        .then(function(assetTransactionResult) {
          return Promise.all(
            args.addresses.map(function(address) {
              const internalObj = {};
              const internalArgs = {
                address: address,
                network: args.network
              };
              return ReadTransactionService.getBalanceHelper(
                bramblHelper,
                internalArgs
              )
                .then(function(result) {
                  internalObj.balance = result;
                  return internalObj;
                })
                .catch(function(err) {
                  console.error(err);
                  internalObj.err = err.message;
                  return internalObj;
                });
            })
          ).catch(function(err) {
            console.error(err);
            obj.err = err.message;
            return obj;
          });
        })
    );
  }
}

module.exports = TransactionServiceHelper;