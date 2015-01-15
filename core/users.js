// Core module for keeping track of users in channels

// TODO: Request names for each channel we're in when this module is loaded?
// TODO: Save user data to the core object so other modules can access it


var user =
{
    client: false,

    // Events that change who is in the room
    methods: ['names', 'join', 'part', 'quit', 'kick', 'kill', 'nick', 'message'],

    // An object for tracking users in rooms
    list: {},

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
    join: function()
    {
        console.log(arguments);

/*
{ '0': '#wetfish',
  '1': 'rachelphone',
  '2':
   { prefix: 'rachelphone!rachel@rachel.test',
     nick: 'rachelphone',
     user: 'rachel',
     host: 'rachel.test',
     command: 'JOIN',
     rawCommand: 'JOIN',
     commandType: 'normal',
     args: [ '#wetfish' ] } }
*/

    },
    
    part: function()
    {
        console.log(arguments);

/*
{ '0': '#wetfish',
  '1': 'rachelphone',
  '2': 'so good at testing',
  '3':
   { prefix: 'rachelphone!rachel@rachel.test',
     nick: 'rachelphone',
     user: 'rachel',
     host: 'rachel.test',
     command: 'PART',
     rawCommand: 'PART',
     commandType: 'normal',
     args: [ '#wetfish', 'so good at testing' ] } }
*/
    },
    
    quit: function()
    {
        console.log(arguments);

/*
{ '0': 'Crionarx',
  '1': 'A TLS packet with unexpected length was received.',
  '2': [ '#wetfish' ],
  '3': 
   { prefix: 'Crionarx!Owner@Fish-lli6ov.res.rr.com',
     nick: 'Crionarx',
     user: 'Owner',
     host: 'Fish-lli6ov.res.rr.com',
     command: 'QUIT',
     rawCommand: 'QUIT',
     commandType: 'normal',
     args: [ 'A TLS packet with unexpected length was received.' ] } }
*/
    },
    
    kick: function()
    {
        console.log(arguments);

/*
{ '0': '#wetfish',
  '1': 'rachelphone',
  '2': 'rachel',
  '3': 'GET OUT',
  '4':
   { prefix: 'rachel!rachel@unicorn.sparkle.princess',
     nick: 'rachel',
     user: 'rachel',
     host: 'unicorn.sparkle.princess',
     command: 'KICK',
     rawCommand: 'KICK',
     commandType: 'normal',
     args: [ '#wetfish', 'rachelphone', 'GET OUT' ] } }
*/
    },
    
    kill: function()
    {
        console.log(arguments);
    },

    // Handler when a user changes their name
    nick: function()
    {
        console.log(arguments);

/*
{ '0': 'rachelphone',
  '1': 'rachelfriend',
  '2': [ '#wetfish' ],
  '3':
   { prefix: 'rachelphone!rachel@rachel.test',
     nick: 'rachelphone',
     user: 'rachel',
     host: 'rachel.test',
     command: 'NICK',
     rawCommand: 'NICK',
     commandType: 'normal',
     args: [ 'rachelfriend' ] } }
*/

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
