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
            rainbow.client[type](from, message);
            console.log("["+from+"] <"+config.name+"> "+message);
        }
    },
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
