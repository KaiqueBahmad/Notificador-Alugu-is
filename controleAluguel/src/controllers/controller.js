const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
const cryptoJS = require("crypto-js");

sessions = {};

exports.homepage = (req, res) => {
  if (req.cookies?.session in sessions) {
    res.redirect("/manage");
  } else {
    res.render("login");
  }
};
exports.tryLogin = (req, res) => {
  var [username, password] = [req.body.username, req.body.password];
  data = readRents();
  if (data[username] && decrypt(data[username]["password"], password) == "OK") {
    sid = uuid.v4();
    sessions[sid] = username;
    res.set("Set-Cookie", `session=${sid}`);
    res.redirect("manage");
  } else {
    res.render("login");
  }
};

exports.checkCookies = (req, res, next) => {
  if (req.cookies?.session in sessions) {
    next();
  } else {
    res.redirect("/");
  }
};

exports.managePage = (req, res) => {
  const inqs = readRents()['samir']["inqs"];
  let grouped = {}

  for (let inq in inqs) {
    if (!(inqs[inq].group in grouped)) {
      grouped[inqs[inq].group] = []
    }
    grouped[inqs[inq].group].push(inqs[inq])
  }
  res.render("manage", { groups: grouped });
};

exports.logoutId = (req, res) => {
  delete sessions[req.cookies?.session];
  res.send("sucess");
};

exports.addRent = (req, res) => {
  var [rentName, lastPaid, group] = [req.body.rentName, req.body.lastPaid, req.body.group];
  lastPaid = new Date(lastPaid);
  if (lastPaid == "Invalid Date") {
    return res.send("error");
  }
  lastPaid = lastPaid.toISOString();
  session = req.cookies?.session;
  if (session in sessions) {
    let data = readRents();
    let username = sessions[session];
    let last = 1;
    for (let i in data[username]["inqs"]) {
      last = i;
    }
    data[username]["inqs"][Number(last) + 1] = {
      "name": rentName,
      "last-paid": lastPaid,
      "group": group,
      "id": Number(last)+1
    };
    writeRents(data);
  }
  return res.send("ok");
};

exports.editRent = (req, res) => {
  console.log('to aqui')
  var [rentName, lastPaid, id] = [
    req.body.rentName,
    req.body.lastPaid,
    req.body.id,
  ];
  session = req.cookies?.session;
  lastPaid = new Date(lastPaid);
  if (lastPaid == "Invalid Date") {
    if (session in sessions) {
      let data = readRents();
      let username = sessions[session];
      data[username]["inqs"][id]["name"] = rentName;
      writeRents(data);
    }
    return res.send("ok");
  }
  if (rentName == "") {
    if (session in sessions) {
      let data = readRents();
      rentName = data[sessions[session]]["inqs"][id]["name"];
    }
  }
  lastPaid = lastPaid.toISOString();
  session = req.cookies?.session;
  if (session in sessions) {
    let data = readRents();
    let username = sessions[session];
    data[username]["inqs"][id] = {
      name: rentName,
      "last-paid": lastPaid,
    };
    writeRents(data);
  }
  return res.send("ok");
};

exports.deleteRent = (req, res) => {
  session = req.cookies?.session;
  if (session in sessions) {
    let data = readRents();
    let username = sessions[session];
    delete data[username]["inqs"][req.query.id];
    writeRents(data);
  }
  res.send("ok");
};
function readRents() {
  data = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "..", "models", "rents.json"), {
      encoding: "utf8",
    })
  );
  return data;
}
exports.sendRents = (req, res) => {
  hashs = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "..", "models", "api-keys.json"), {
      encoding: "utf8",
    })
  )["API-KEYS"];
  for (let hash of hashs) {
    if (decrypt(hash, req.headers.token) == "OK") {
      res.json(readRents());
    } else {
      res.send("bad token");
    }
  }
};
exports.updateItem = (req, res) => {
  data = readRents()
  var [client, item] = [req.body.owner,req.body.id];
  data[client]['inqs'][item]['last-paid'] = sumYear(data[client]['inqs'][item]['last-paid'])
  writeRents(data)
  res.json(data)
};

//FUNCTIONS FOR ENCRYPT AND DECRYPT, FOR SAFENESS
function encrypt(key) {
  return cryptoJS.AES.encrypt("OK", key).toString();
}
function decrypt(hash, key) {
  return cryptoJS.AES.decrypt(hash, key).toString(cryptoJS.enc.Utf8);
}

function sumYear(str) {
  updated = String(Number(str.slice(0,4))+1)
  return updated+str.slice(4)
}

function writeRents(newRent) {
  newRent = JSON.stringify(newRent);
  fs.writeFileSync(
    path.resolve(__dirname, "..", "models", "rents.json"),
    newRent
  );
}
