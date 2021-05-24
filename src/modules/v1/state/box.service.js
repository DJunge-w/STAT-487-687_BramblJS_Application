/* eslint-disable no-unused-vars */
const mongoose = require("mongoose");
const stdError = require("../../../core/standardError");
const BoxModel = require("./box.model");
const save2db = require("../../../lib/saveToDatabase");
const {
  checkExistsByAddress,
  checkExistsByBifrostId
} = require("../../../lib/validation");
const Address = require("../addresses/addresses.model");

const serviceName = "Box";

class BoxService {
  static async saveToDb(args) {
    const session = await mongoose.startSession();
    try {
      // fetch information of address for box
      let fetchedAddress = await checkExistsByAddress(
        Address,
        args.address
      ).then(function(result) {
        if (result.error) {
          throw stdError(
            500,
            "Unable to find corresponding address for box",
            serviceName,
            serviceName
          );
        } else {
          return result;
        }
      });

      const timestamp = new Date();
      // if box is not provided
      if (!args.box) {
        stdError(400, "No box provided to save", serviceName, serviceName);
      }

      let boxDoc = {
        address: args.address,
        nonce: args.nonce,
        bifrostId: args.bifrostId,
        evidence: args.evidence,
        boxType: args.boxType,
        value: args.value
      };

      boxDoc.isActive = {
        status: true,
        asOf: timestamp
      };
      let newBox = new BoxModel(boxDoc);

      // Save address and box in transaction
      if (fetchedAddress.doc) {
        fetchedAddress.doc.boxes.push(newBox._id);
        await save2db([fetchedAddress.doc, newBox], {
          timestamp,
          serviceName,
          session
        }).then(function(result) {
          if (result.error) {
            throw stdError(500, result.error, serviceName, serviceName);
          } else {
            return result;
          }
        });
      } else {
        await save2db(newBox, { timestamp, serviceName, session })
          .then(function(result) {
            if (result.error) {
              throw stdError(500, result.error, serviceName, serviceName);
            } else {
              return result;
            }
          })
          .catch(function(err) {
            console.error(err);
            throw stdError(
              400,
              "Invalid Payload: Unable to update box in DB",
              serviceName,
              serviceName
            );
          });
      }
      return newBox;
    } catch (err) {
      if (err.name === "MongoError" && err.code === 11000) {
        throw stdError(
          422,
          "The provided box is already in use",
          serviceName,
          serviceName
        );
      } else {
        throw err;
      }
    } finally {
      session.endSession();
    }
  }

  static async updateBoxById(args) {
    // check if the box exists in the db
    let self = this;
    await checkExistsByBifrostId(BoxModel, args.id)
      .then(function(result) {
        if (!result.doc.isActive.status) {
          throw stdError(404, "No Active Box Found", serviceName, serviceName);
        } else {
          self.updateBox(args, result.doc);
        }
      })
      .catch(function(err) {
        throw stdError(
          500,
          "Unable to update box by Bifrost Id",
          serviceName,
          serviceName
        );
      });
  }

  static async updateBox(args, fetchedBox) {
    const session = await mongoose.startSession();
    try {
      const timestamp = new Date();

      // update fields
      fetchedBox.address = args.address ? args.address : fetchedBox.address;
      fetchedBox.nonce = args.nonce ? args.nonce : fetchedBox.nonce;
      fetchedBox.evidence = args.evidence ? args.evidence : fetchedBox.evidence;
      fetchedBox.value = args.value ? args.value : fetchedBox.value;
      // save
      await save2db(fetchedBox, { timestamp, serviceName, session });
      return fetchedBox;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      session.endSession();
    }
  }

  static async getBoxById(args) {
    try {
      // check if box exists and is active
      const fetchedBox = await checkExistsByBifrostId(BoxModel, args.id, {
        serviceName
      })
        .then(function(result) {
          if (!result.isActive.status) {
            throw stdError(
              404,
              "No Active Box Found",
              serviceName,
              serviceName
            );
          }
        })
        .catch(function(err) {
          throw stdError(
            500,
            "Unable to find box by Bifrost Id",
            serviceName,
            serviceName
          );
        });

      if (!fetchedBox.isActive.status) {
        throw stdError(404, "No Active Boxes", serviceName, serviceName);
      }

      return fetchedBox;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = BoxService;