const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
  network: {
    type: String,
    required: true
  },
  keyfile: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    address: {
      type: String,
      required: true
    },
    crypto: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      mac: {
        type: String,
        required: true
      },
      kdf: {
        type: String,
        required: true
      },
      cipherText: {
        type: String,
        required: true
      },
      kdfSalt: {
        type: String,
        required: true
      },
      cipher: {
        type: String,
        required: true
      },
      cipherParams: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        iv: {
          type: String,
          required: true
        }
      }
    }
  },
  isActive: {
    type: mongoose.Schema.Types.Mixed,
    status: {
      type: Boolean,
      default: true
    },
    asOf: {
      type: Date
    },
    required: true
  }
});

// eslint-disable-next-line no-undef
module.exports = Address = mongoose.model("address", AddressSchema);