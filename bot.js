var irc = require("irc");

// Get server configuration
var config = require("./config/server.js");

// Connect to IRC
var client = new irc.Client(config.server, config.name, config);

// Get modules that should be loaded immediately
var modules = require("./config/modules.js");

// Require core functions
var core = require("./core.js");

// Initialize modules with the existing client
core.init(client, modules);

