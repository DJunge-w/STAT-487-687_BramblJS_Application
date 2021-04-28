const connections = require(`./connections`);
const networkUrl = connections.networkUrl;
const projectId = connections.projectId;
const apiKey = connections.networkApiKey;
const BramblJS = require("brambljs");

class BramblHelper {
  constructor(password, network) {
    // Initialize bramblJS and set request body to the url provided in the configuration
    const bramblJsRequests = {
      url: `${networkUrl}${projectId}`,
      apiKey: `${apiKey}`
    };

    this.brambljs = new BramblJS({
      networkPrefix: network,
      Requests: bramblJsRequests,
      password: password
    });
  }

  /**
   * Generates a new public address and private key file and stores private keyfile in the DB
   * @return {Promise} object with address and keyfile
   */
  async createAddress() {
    return new Promise(resolve => {
      const a = this.brambljs.keyManager.address;
      const kf = this.brambljs.keyManager.getKeyStorage();

      const Address = {
        address: a,
        keyfile: kf
      };

      //console.log("new address", a);
      resolve(Address);
    });
  }
}

module.exports = BramblHelper;