var mongojs = require("mongojs");
var config = require('./config');

module.exports.mongodb = mongojs.connect(config.database.mongo, ["users"]);