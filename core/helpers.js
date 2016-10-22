// Miscelaneous core helper functions

var core;
var config = require("../config/server.js");

// Object to maintain the registration status of users
var registered = {};

var helper =
{
    events: ['raw'],

    // Bind client events to the matching function names in the passed object
    bind: function(events, object)
    {
        for(var i = 0, l = events.length; i < l; i++)
        {
            var event = events[i];
            core.client.addListener(event, object[event]);
        }
    },

    // Unbind client events from the passed object
    unbind: function(events, object)
    {
        for(var i = 0, l = events.length; i < l; i++)
        {
            var event = events[i];
            core.client.removeListener(event, object[event]);
        }
    },

    // Function which intelligently replies to messages sent via PM and in channels
    reply: function(type, from, to, message)
    {
        // If this is a channel message
        if(to.charAt(0) == '#')
        {
            core.client[type](to, message);
            console.log("["+to+"] <"+config.name+"> "+message);
        }
        else
        {
            core.client[type](from, message);
            console.log("["+from+"] <"+config.name+"> "+message);
        }
    },

    // Function to parse a message for potential commands
    parseCommand: function(prefix, message)
    {
        // Check for the prefix
        if(message.charAt(0) == prefix)
        {
            message = message.substr(1);
            var chunks = message.split(' ');
            var command = chunks.shift().toString().toLowerCase();
            message = chunks.join(' ');

            return {'command': command, 'message': message, 'chunks': chunks};
        }

        return false;
    },

    // Helper function to check if a user is registered
    isRegistered: function(user, callback)
    {
        // Remove this user from the registered object in case they've been deauthed
        delete registered[user];

        // Now make sure this user is still logged in
        core.client.whois(user, function()
        {
            if(registered[user])
            {
                callback(true);
            }
            else
            {
                callback(false);
            }
        });
    },

    // Function for parsing raw data from the IRC server, used for checking if a user is registered or not
    raw: function(data)
    {
        if(data.rawCommand == 307)
        {
            var user = data.args[1];
            registered[user] = true;
        }
    },
};

module.exports =
{
    load: function(_client, _core)
    {
        core = _core;
        core.helper = helper;
        helper.bind(helper.events, helper);
    },

    unload: function()
    {
        delete core.helper;
        helper.unbind(helper.events, helper);
    }
};
