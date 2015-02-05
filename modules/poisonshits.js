// secure random number generation is IMPORTANT
var crypto = require("crypto");

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

    // Build list of users
    get_users: function()
    {
        shit.users = [];
        
        for(var i = 0, keys = Object.keys(shit.client.chans['#wetfish'].users), l = keys.length; i < l; ++i)
        {
            var user = keys[i];

            // Don't shit yourself
            if(user != "fishy")
                shit.users.push(user);
        }

    },

    random_target: function(not)
    {
        // Make sure not is an array
        if(!Array.isArray(not))
            not = [];
        
        // Loop 10 times trying to find a unique target
        for(var i = 0; i < 10; i++)
        {
            var index = crypto.randomBytes(1).readUInt8(0) % shit.users.length;

            // If this is a unique target
            if(not.indexOf(shit.users[index]) == -1)
                return shit.users[index];
        }
    },

    random_targets: function(from, message)
    {
        // Refresh the user list
        shit.get_users();

        // If there's a potential target
        message = shit.parse(message);
        
        var target =
        {
            request: message[0],
            random: random_target(),
            user: from
        };

        // Make sure there's actually a requested target, but not the one we already generated!
        if(!target.request)
            target.request = random_target([target.random]);

        return target;
    },

    poisonshits: function(from, to, message)
    {
        var timeout = shit.waiting();
        
        if(timeout)
        {
            shit.reply('say', from, from, "Can't shit, won't shit. ("+timeout+" seconds remaining)");
            return;
        }

        // Pick random targets
        var target = shit.random_targets(from, message);

        // Pick the actual target at random
        var action = crypto.randomBytes(1).readUInt8(0) % 3;

        if(action == 0)
            target.actual = target.request;
        else if(action == 1)
            target.actual = target.random;
        else
            target.actual = target.user;

        // Wait a second
        setTimeout(function() { shit.reply('say', from, to, "fishy murmurs a ritual..."); }, 1000);
        setTimeout(function() { shit.reply('say', from, to, target.request+"'s and "+target.random+"'s names materialize out of turds"); }, 3000);
        setTimeout(function() { shit.reply('say', from, to, "... "+target.actual+"!"); }, 6000);
        setTimeout(function() { shit.client.send('KICK', to, target.actual, "POISONSHITSPOISONSHITSPOISONSHITSPOISONSHITSPOISONSHITSPOISONSHITS"); }, 8000);
    },

    superpoisonshits: function(from, to, message)
    {
        // Not implimented
        return;
    },

    bind: function()
    {
        shit.client.addListener('message', shit.message);
    },

    unbind: function()
    {
        shit.client.removeListener('message', shit.message);
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
