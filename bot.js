var irc = require("irc");
var config = require("./config/wetfish.js");

var client = new irc.Client(config.server, config.name, config);
