// secure random number generation is IMPORTANT
var crypto = require("crypto");

/* Classic #wetfish commands
 *
 * slapshit

Interested in a little palm to anal action?

How to perform the deed.

!slapshit - Casually slaps a random users shit.
!superslapshit - Knocks a random user out of the room by the shit.
!superslapshitv2 - Knocks a random user out of the room by the shit, but v2.
!supersuckurdick - I don't know how or WHY, it's just here OKAY?
!superslapaniggasshit - Nigga you better shut yo gatdam lip.

*
*
*/

var shit =
{
    commands: ['poisonshits', 'superpoisonshits'],
    client: false,
    core: false,
    users: [],
    wait: false,
    timeout: false,

    parse: function(input)
    {
        if(typeof input != "string")
            input = "";
            
        return input.split(" ");
    },
    
    // Accept commands from shit input!
    // Based on user/hostname
 
    // This really should be a core function or something
    reply: function(type, from, to, message)
    {
        // If this is a channel message
        if(to.charAt(0) == '#')
        {
            shit.client[type](to, message);
            console.log("["+to+"] <fishy> "+message);
        }
        else
        {
            shit.client[type](from, message);
            console.log("["+from+"] <fishy> "+message);
        }
    },

    message: function(from, to, message, details)
    {
        var userhost = details.nick + '@' + details.host;

        // shit commands are prefixed with !
        if(message.charAt(0) == "!")
        {
            message = message.substr(1);
            message = message.split(' ');

            var command = message.shift().toString().toLowerCase();

            // If this command is valid
            if(shit.commands.indexOf(command) > -1)
            {
                message = message.join(' ');
                shit[command](from, to, message);
            }
        }
    },

    names: function(channel, users)
    {
        shit.users = [];
        
        for (var i = 0, keys = Object.keys(users), l = keys.length; i < l; ++i)
        {
            var user = keys[i];

            // Don't poison yourself
            if(user != "fishy")
                shit.users.push(user);
        }

        console.log(shit.users);
    },

    waiting: function(timeout)
    {
        if(shit.wait)
        {
            var timeout = (shit.timeout.getTime() - new Date().getTime()) / 1000;
            return timeout;
        }

        if(typeof timeout == "undefined")
            timeout = 1;

        var date = new Date();
        shit.timeout = new Date(date.getTime() + (timeout * 60 * 1000));

        shit.wait = setTimeout(function()
        {
            shit.wait = false;
            shit.timeout = false;
        }, timeout * 60 * 1000);
    },

    random_target: function(from, message)
    {
        // If there's a potential target
        if(message)
        {
            var message = message.split(' ');
            var action = crypto.randomBytes(1).readUInt8(0) % 3;

            // Attack the target
            if(action == 0)
            {
                // If the target doesn't exist
                if(shit.users.indexOf(message[0]) < 0)
                    return from;

                return message[0];
            }
            
            // Attack the caster
            else if(action == 1)
                return from;

            // Else, use the default behavior
        }
        
        var index = crypto.randomBytes(1).readUInt8(0) % shit.users.length;
        
        return shit.users[index];
    },

    poisonshits: function(from, to, message)
    {
        var timeout = shit.waiting();
        
        if(timeout)
        {
            shit.reply('say', from, from, "Can't shit, won't shit. ("+timeout+" seconds remaining)");
            return;
        }

        var request = shit.parse(message);

        if(request[0].trim() == "")
            request = shit.random_target(from, message);
        else
            request = request[0].trim();
        
        // Pick a random target
        var target = shit.random_target(from, message);

        // Refresh userlist from the server
        shit.client.send('NAMES', '#wetfish');

        // Wait a second
        setTimeout(function()
        {
            // Regenerate target and hope we recieved a NAMES response by now
            target = shit.random_target(from, message);

            shit.reply('say', from, to, "fishy murmurs a ritual...");
        }, 1000);

        setTimeout(function() { shit.reply('say', from, to, request+"'s and "+target+"'s names materialize out of turds"); }, 3000);
        setTimeout(function() { shit.reply('say', from, to, "... "+target+"!"); }, 6000);
        setTimeout(function() { shit.client.send('KICK', to, target, "POISONSHITSPOISONSHITSPOISONSHITSPOISONSHITSPOISONSHITSPOISONSHITS"); }, 8000);
    },

    superpoisonshits: function(from, to, message)
    {
        // Not implimented
        return;
    },

    bind: function()
    {
        shit.client.addListener('message', shit.message);
        shit.client.addListener('names', shit.names);
    },

    unbind: function()
    {
        shit.client.removeListener('message', shit.message);
        shit.client.removeListener('names', shit.names);
    }
}

module.exports =
{
    load: function(client, core)
    {
        shit.client = client;
        shit.core = core;
        shit.bind();
    },

    unload: function()
    {
        shit.unbind();
        delete shit;
        delete crypto;
   },
}
