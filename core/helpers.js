// Miscelaneous core helper functions

var core;
var config = require("../config/server.js");

var helper =
{
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
            message = message.split(' ');

            var command = message.shift().toString().toLowerCase();
            message = message.join(' ');

            return {'command': command, 'message': message};
        }

        return false;
    }
};

module.exports =
{
    load: function(_client, _core)
    {
        core = _core;
        core.helper = helper;
    },

    unload: function()
    {
        delete core.helper;
    }
};
