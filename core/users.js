// Core module for keeping track of users in channels

// TODO: Request names for each channel we're in when this module is loaded?
// TODO: Save user data to the core object so other modules can access it
// TODO: Handle user mode changes

var user =
{
    client: false,

    // Events that change who is in the room
    methods: ['names', 'join', 'part', 'quit', 'kick', 'nick', 'message'],

    // An object for tracking users in rooms
    list: {},

    // Function to find users in user lists
    find: function(channel, username)
    {
        var user_list = user.list[channel];

        // No user list, user not found!
        if(typeof user_list == undefined || !user_list.length)
            return -1;

        // Else, loop through users
        for(var i = 0, l = user_list.length; i < l; i++)
        {
            // Match found?
            if(user_list[i].name == username)
                return i;
        }

        // No result found?
        return -1;
    },

    // Handler when first joining a channel
    names: function(channel, users)
    {
        var user_list = [];
        
        // Loop through user object to build an array
        for (var i = 0, keys = Object.keys(users), l = keys.length; i < l; ++i)
        {
            var user_data =
            {
                name: keys[i],
                mode: users[keys[i]]
            };
            
            user_list.push(user_data);
        }

        // Save this list to the channel
        user.list[channel] = user_list;
    },

    // Handlers when users join or leave
    join: function(channel, username)
    {
        // Build user data
        var user_data =
        {
            name: username,
            mode: ''
        };

        user.list[channel].push(user_data);
    },
    
    part: function(channel, username, message)
    {
        var index = user.find(channel, username);
        
        // Hopefully the user exists in the user list...
        if(index > -1)
        {
            user.list[channel].splice(index, 1);
        }
    },
    
    quit: function(username, message, channels)
    {
        // Loop through all channels this user was seen quitting from
        for(var i = 0, l = channels.length; i < l; i++)
        {
            var channel = channels[i];
            var index = user.find(channel, username);

            if(index > -1)
            {
                user.list[channel].splice(index, 1);
            }
        }
    },
    
    kick: function(channel, username, message)
    {
        var index = user.find(channel, username);

        if(index > -1)
        {
            user.list[channel].splice(index, 1);
        }
    },
    
    // Handler when a user changes their name
    nick: function(old_name, new_name, channels)
    {
        
    },

    message: function(from, to, message, details)
    {
        console.log(arguments);
        if(message == ':debug users')
            console.log(user.list);
    },

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

        // Automatically request names on load (for debugging :)
        user.client.send('NAMES', '#wetfish');
    },

    unload: function()
    {
        user.unbind();
        delete user;
    }
}
