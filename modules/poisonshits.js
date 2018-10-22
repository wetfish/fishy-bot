// secure random number generation is IMPORTANT
var crypto = require("crypto");

var shit =
{
    commands: ['poisonshits', 'superpoisonshits'],
    client: false,
    core: false,
    users: [],
    wait: false,
    hostWait: {},
    timeout: false,
    hostTimeout: {},

    parse: function(input)
    {
        if(typeof input != "string")
            input = "";

        return input.split(" ");
    },

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
                shit[command](from, to, message, details);
            }
        }
    },

    waiting: function(timeout, host, extra)
    {
        // If there's a timeout for this user specifically
        if(shit.hostWait[host])
        {
            var timeout = (shit.hostTimeout[host].getTime() - new Date().getTime()) / 1000;
            return timeout;
        }

        // If there's a general timeout
        if(shit.wait)
        {
            var timeout = (shit.timeout.getTime() - new Date().getTime()) / 1000;
            return timeout;
        }

        if(typeof timeout == "undefined")
            timeout = 1;

        if(typeof extra == "undefined")
            extra = 0;

        // Set general timeouts
        var date = new Date();
        shit.timeout = new Date(date.getTime() + (timeout * 60 * 1000));

        shit.wait = setTimeout(function()
        {
            shit.wait = false;
            shit.timeout = false;
        }, timeout * 60 * 1000);

        // Set user-specific timeouts
        shit.hostTimeout[host] = new Date(date.getTime() + (extra * 60 * 1000));

        shit.hostWait[host] = setTimeout(function()
        {
            shit.hostWait[host] = false;
            shit.hostTimeout[host] = false;
        }, extra * 60 * 1000);
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
            random: shit.random_target(),
            user: from
        };

        // Make sure there's actually a requested target, but not the one we already generated!
        if(!target.request)
            target.request = shit.random_target([target.random]);

        return target;
    },

    // Check if a user is a channel operator or a normal user
    vulnerable: function(user, channel)
    {
        if(shit.client.chans[channel] && shit.client.chans[channel].users[user])
        {
            if(!shit.client.chans[channel].users[user].match(/[@%&~]/))
            {
                return true;
            }
        }

        return false;
    },

    poisonshits: function(from, to, message, details)
    {
        if(!shit.vulnerable(from, to))
        {
            shit.reply('say', from, to, "You clearly take your moderation duties very seriously");
            return;
        }

        var timeout = shit.waiting(5, details.host);

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

    superpoisonshits: function(from, to, message, details)
    {
        if(!shit.vulnerable(from, to))
        {
            shit.reply('say', from, to, "Don't you have a job to do or something?");
            return;
        }

        var timeout = shit.waiting(15, details.host, 5 * 60);

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
        setTimeout(function() { shit.reply('say', from, to, "... "+target.actual+" is cursed with a bleeding anus!"); }, 6000);

        // Generate three random times between 6 seconds and 5 hours
        setTimeout(function() { shit.client.send('KICK', to, target.actual, "SUPERPOISONSHITSSUPERPOISONSHITSSUPERPOISONSHITSSUPERPOISONSHITSSUPERPOISONSHITSSUPERPOISONSHITS"); }, Math.floor((Math.random() * 5 * 60 * 60 * 1000) + 6000));
        setTimeout(function() { shit.client.send('KICK', to, target.actual, "SUPERPOISONSHITSSUPERPOISONSHITSSUPERPOISONSHITSSUPERPOISONSHITSSUPERPOISONSHITSSUPERPOISONSHITS"); }, Math.floor((Math.random() * 5 * 60 * 60 * 1000) + 6000));
        setTimeout(function() { shit.client.send('KICK', to, target.actual, "SUPERPOISONSHITSSUPERPOISONSHITSSUPERPOISONSHITSSUPERPOISONSHITSSUPERPOISONSHITSSUPERPOISONSHITS"); }, Math.floor((Math.random() * 5 * 60 * 60 * 1000) + 6000));
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
