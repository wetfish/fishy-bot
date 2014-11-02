// secure random number generation is IMPORTANT
var crypto = require("crypto");

/* Classic #wetfish commands
 *
 * slapanus

Interested in a little palm to anal action?

How to perform the deed.

!slapanus - Casually slaps a random users anus.
!superslapanus - Knocks a random user out of the room by the anus.
!superslapanusv2 - Knocks a random user out of the room by the anus, but v2.
!supersuckurdick - I don't know how or WHY, it's just here OKAY?
!superslapaniggasanus - Nigga you better shut yo gatdam lip.

*
*
*/

var anus =
{
    commands: ['slapanus', 'superslapanus', 'superslapanusv2', 'supersuckurdick', 'superslapaniggasanus'],
    client: false,
    core: false,
    users: [],
    
    // Accept commands from anus input!
    // Based on user/hostname
 
    // This really should be a core function or something
    reply: function(type, from, to, message)
    {
        // If this is a channel message
        if(to.charAt(0) == '#')
        {
            anus.client[type](to, message);
            console.log("["+to+"] <fishy> "+message);
        }
    },

    message: function(from, to, message, details)
    {
        var userhost = details.nick + '@' + details.host;

        // anus commands are prefixed with !
        if(message.charAt(0) == "!")
        {
            message = message.substr(1);
            message = message.split(' ');

            var command = message.shift();

            // If this command is valid
            if(anus.commands.indexOf(command) > -1)
            {
                message = message.join(' ');
                anus[command](from, to, message);
            }
        }
    },

    names: function(channel, users)
    {
        anus.users = [];
        
        for (var i = 0, keys = Object.keys(users), l = keys.length; i < l; ++i)
        {
            var user = keys[i];

            // Don't slap yourself
            if(user != "fishy")
                anus.users.push(user);
        }
    },

    random_target: function()
    {
        var index = crypto.randomBytes(1).readUInt8(0) % anus.users.length;
        return anus.users[index];
    },

    slapanus: function(from, to, message)
    {
        // Pick a random target
        var target = anus.random_target();

        // Refresh userlist from the server
        anus.client.send('NAMES', '#wetfish');

        // Wait a second
        setTimeout(function()
        {
            // Regenerate target and hope we recieved a NAMES response by now
            target = anus.random_target();

            anus.reply('say', from, to, "4It's Anus Slapping Time!");
        }, 1000);

        setTimeout(function() { anus.reply('say', from, to, "fishy spits onto the floor!"); }, 3000);
        setTimeout(function() { anus.reply('say', from, to, "The saliva reads..."); }, 6000);
        setTimeout(function() { anus.reply('say', from, to, target+"!"); }, 8000);
        setTimeout(function() { anus.reply('action', from, to, "slaps "+target+"'s anus!"); }, 10000);
    },

    superslapanus: function(from, to, message)
    {
        // Pick a random target
        var target = anus.random_target();

        // Refresh userlist from the server
        anus.client.send('NAMES', '#wetfish');

        // Wait a second
        setTimeout(function()
        {
            // Regenerate target and hope we recieved a NAMES response by now
            target = anus.random_target();

            anus.reply('say', from, to, "4IT'S 3S8U11P4E6R12!9!8 4ANUS SLAPPING TIME!");
        }, 1000);

        setTimeout(function() { anus.reply('say', from, to, "fishy spits onto the floor!"); }, 3000);
        setTimeout(function() { anus.reply('say', from, to, "The saliva reads..."); }, 6000);
        setTimeout(function() { anus.reply('say', from, to, target+"!"); }, 8000);
        setTimeout(function() { anus.reply('action', from, to, "3S8U11P4E6R12!9!8 slaps "+target+"'s anus!!"); }, 10000);
        setTimeout(function() { anus.client.send('KICK', to, target, "3S8U11P4E6R10A9N8A4L3S8U11P4E6R10A9N8A4L3S8U11P4E6R10A9N8A4L3S8U11P4E6R10A9N8A4L3S8U11P4E6R10A9N8A4L"); }, 12000);
    },

    superslapanusv2: function(from, to, message)
    {
        // Pick a random target
            var target = anus.random_target();

        // Refresh userlist from the server
        anus.client.send('NAMES', '#wetfish');

        // Wait a second
        setTimeout(function()
        {
            // Regenerate target and hope we recieved a NAMES response by now
            target = anus.random_target();

            anus.reply('say', from, to, "4It's Anus Slapping Time!");
        }, 1000);

        setTimeout(function() { anus.reply('say', from, to, "fishy spits onto the floor!"); }, 3000);
        setTimeout(function() { anus.reply('say', from, to, "The saliva reads..."); }, 6000);
        setTimeout(function() { anus.reply('say', from, to, target+"!"); }, 8000);
        setTimeout(function() { anus.reply('action', from, to, "slaps "+target+"'s anus!"); }, 10000);
    },

    supersuckurdick: function(from, to, message)
    {
        // Pick a random target
        var target = anus.random_target();

        // Refresh userlist from the server
        anus.client.send('NAMES', '#wetfish');

        // Wait a second
        setTimeout(function()
        {
            // Regenerate target and hope we recieved a NAMES response by now
            target = anus.random_target();

            anus.reply('say', from, to, "4It's Anus Slapping Time!");
        }, 1000);

        setTimeout(function() { anus.reply('say', from, to, "fishy spits onto the floor!"); }, 3000);
        setTimeout(function() { anus.reply('say', from, to, "The saliva reads..."); }, 6000);
        setTimeout(function() { anus.reply('say', from, to, target+"!"); }, 8000);
        setTimeout(function() { anus.reply('action', from, to, "slaps "+target+"'s anus!"); }, 10000);
    },

    superslapaniggasanus: function(from, to, message)
    {
        // Pick a random target
        var target = anus.random_target();

        // Refresh userlist from the server
        anus.client.send('NAMES', '#wetfish');

        // Wait a second
        setTimeout(function()
        {
            // Regenerate target and hope we recieved a NAMES response by now
            target = anus.random_target();

            anus.reply('say', from, to, "4It's Anus Slapping Time!");
        }, 1000);

        setTimeout(function() { anus.reply('say', from, to, "fishy spits onto the floor!"); }, 3000);
        setTimeout(function() { anus.reply('say', from, to, "The saliva reads..."); }, 6000);
        setTimeout(function() { anus.reply('say', from, to, target+"!"); }, 8000);
        setTimeout(function() { anus.reply('action', from, to, "slaps "+target+"'s anus!"); }, 10000);
    },

    bind: function()
    {
        anus.client.addListener('message', anus.message);
        anus.client.addListener('names', anus.names);
    },

    unbind: function()
    {
        anus.client.removeListener('message', anus.message);
        anus.client.removeListener('names', anus.names);
    }
}

module.exports =
{
    load: function(client, core)
    {
        anus.client = client;
        anus.core = core;
        anus.bind();
    },

    unload: function()
    {
        anus.unbind();
        delete anus;
        delete crypto;
   },
}
