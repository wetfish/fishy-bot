// Core module for keeping track of users in channels

var user =
{
    client: false,

    // Events that change who is in the room
    methods: ['names', 'join', 'part', 'quit', 'kick', 'kill', 'nick'],

    // An object for tracking users in rooms
    list: {},

    // Handler when first joining a channel
    names: function() {},

    // Handlers when users join or leave
    join: function() {},
    part: function() {},
    quit: function() {},
    kick: function() {},
    kill: function() {},

    // Handler when a user changes their name
    nick: function() {},


    bind: function()
    {
        for(var i = 0, l = user.methods.length; i < l; i++)
        {
            var method = user.methods[i];
            user.client.addListener(method, user[method]);
        }
    },

    unbind: function()
    {
        for(var i = 0, l = user.methods.length; i < l; i++)
        {
            var method = user.methods[i];
            user.client.removeListener(method, user[method]);
        }
    }
};

module.exports =
{
    load: function(client)
    {
        user.client = client;
        user.bind();
    },

    unload: function()
    {
        user.unbind();
        delete user;
    }
}
