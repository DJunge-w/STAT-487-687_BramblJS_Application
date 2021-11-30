const express = require("express");
const BramblJS = require("brambljs");
const Services = require("./services");
const CONFIG = require('@stat687/config');

// network prefix is required and must match the networkPrefix for requests and keyManager
const brambl = new BramblJS({
  networkPrefix: "valhalla",
  KeyManager: new BramblJS.KeyManager({
    password: "password",
    networkPrefix: "valhalla",
    keyFile: {
      address: "3NKYYZt2nPYgr6ztWkUWq2nTdKPESW5KHPjqVeYopXXKWB2Aais3",
      crypto: {
        mac: "9nd8zf9hAWj563aXwaUjp7TjpJqbRttDug3ANHVVfPev",
        kdf: "scrypt",
        cipherText:
          "51bQEmHdLu3NGytTJ2fHsZDFcTvxLXExfqmdhAe4ryK7eqzZBkW4GvvMfMDxW9JrWff1vpYfoy1AQMTN6LVhRaYW",
        kdfSalt: "8xFQToxsGjUZ12i1FQNCTGXcYmgaN86UYSo8QqJtiuDj",
        cipher: "aes-256-ctr",
        cipherParams: { iv: "YQHf3biwyMaAzGBbbCGYZG" }
      }
    }
  }),
  Requests: {
    url: "https://vertx.topl.services/valhalla/6189846fed4fe00011d2322c",
    apiKey: "Yjc3MjkyMmUtZmQxYy00ZThjLWE0ODQtOTYwODY0YWU1ODZi"
  }
});

const services = Services(brambl);
const app = express();

// app.set('json spaces', 2);

app.get("/", (req, res, next) => {
  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(`Hello World!`, null,4));
});

app.get("/head", async (req, res, next) => {
  const result = await services
    .getHead()
    .catch((err) => `Something went wrong: ${err.message}`);
  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(result, null,4));
});

app.get("/address", async (req, res, next) => {
  const result = brambl.keyManager.address;
  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(result, null,4));
});

app.get("/balance", async (req, res, next) => {
  const result = await services
    .getBalance(brambl.keyManager.address)
    .then((res) => res.result)
    .catch((err) => `Something went wrong: ${err.message}`);
  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(result, null,4));
});

app.get("/assettotal/:name", async (req, res, next) => {
  const assetCode = await services
    .generateAssetCode(req.params.name)
    .catch((err) => `Something went wrong: ${err.message}`);
  const balance_str = await services
    .getBalance(brambl.keyManager.address)
    .then((res) => res.result)
    .catch((err) => `Something went wrong: ${err.message}`);
  const total = services.getAssetTotal(balance_str, assetCode, brambl.keyManager.address);
  console.log(total);
  // services.getAssetTotal(balance_str, assetCode, brambl.keyManager.address);
  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(balance_str, null,4));
});

app.get("/balance/:addr", async (req, res, next) => {
  const result = await services
    .getBalance(req.params.addr)
    .then((res) => res.result)
    .catch((err) => `Something went wrong: ${err.message}`);
  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(result, null,4));
});

app.get("/assetcode/:name", async (req, res, next) => {
  const result = await services
    .generateAssetCode(req.params.name)
    .catch((err) => `Something went wrong: ${err.message}`);
  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(result, null,4));
});

app.get("/mint/:addr/:name/:quantity", async (req, res, next) => {
  const result = await services
    .mint(
      req.params.addr,
      req.params.name,
      req.params.quantity,
      req.query.securityRoot,
      req.query.metadata
    )
    .catch((err) => `Something went wrong: ${JSON.stringify(err)}`);
  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(result, null,4));
});

app.get("/transfer/:addr/:assetcode/:quantity", async (req, res, next) => {
  const result = await services
    .transfer(
      req.params.addr,
      req.params.assetcode,
      req.params.quantity,
      req.query.securityRoot,
      req.query.metadata
    )
    .catch((err) => `Something went wrong: ${JSON.stringify(err)}`);
  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(result, null,4));
});

/** create a server object */
app.listen(CONFIG.PORT, () => {
  console.log("Server running on port " + CONFIG.PORT);
});
