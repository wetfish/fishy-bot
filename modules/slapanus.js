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
    wait: false,
    timeout: false,
    
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
        else
        {
            anus.client[type](from, message);
            console.log("["+from+"] <fishy> "+message);
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

            var command = message.shift().toString().toLowerCase();

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

    waiting: function(timeout)
    {
        if(anus.wait)
        {
            var timeout = (anus.timeout.getTime() - new Date().getTime()) / 1000;
            return timeout;
        }

        if(typeof timeout == "undefined")
            timeout = 1;

        var date = new Date();
        anus.timeout = new Date(date.getTime() + (timeout * 60 * 1000));

        anus.wait = setTimeout(function()
        {
            anus.wait = false;
            anus.timeout = false;
        }, timeout * 60 * 1000);
    },

    random_target: function()
    {
        var index = crypto.randomBytes(1).readUInt8(0) % anus.users.length;
        return anus.users[index];
    },

    slapanus: function(from, to, message)
    {
        var timeout = anus.waiting();
        
        if(timeout)
        {
            anus.reply('say', from, from, "Can't slap, won't slap. ("+timeout+" seconds remaining)");
            return;
        }
        
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
        var timeout = anus.waiting(5);
        
        if(timeout)
        {
            anus.reply('say', from, from, "Can't slap, won't slap. ("+timeout+" seconds remaining)");
            return;
        }
        
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
        var timeout = anus.waiting(5);
        
        if(timeout)
        {
            anus.reply('say', from, from, "Can't slap, won't slap. ("+timeout+" seconds remaining)");
            return;
        }
        
        // Pick a random target
        var target = anus.random_target();

        // Refresh userlist from the server
        anus.client.send('NAMES', '#wetfish');

        // Wait a second
        setTimeout(function()
        {
            // Regenerate target and hope we recieved a NAMES response by now
            target = anus.random_target();

            anus.reply('say', from, to, "6,4I13,07T12,08S3,09 8,12S7,13U4,06P6,04E13,07R12,08 3,09S8,12L7,13A4,06P6,04 13,07A12,08N3,09U8,12S7,13 4,06v6,04213,07 12,08!3,09!8,12!7,13!4,06!6,04!13,07!12,08!3,09!");
        }, 1000);


        setTimeout(function() { anus.reply('say', from, to, "fishy spits onto the floor!"); }, 3000);
        setTimeout(function() { anus.reply('say', from, to, "The saliva reads..."); }, 6000);
        setTimeout(function() { anus.reply('say', from, to, target+"!"); }, 8000);
        setTimeout(function() { anus.reply('action', from, to, " 6,4S13,07U12,08P3,09E8,12R slaps "+target+"'s anus!!!!"); }, 10000);
        setTimeout(function() { anus.client.send('KICK', to, target, "6,4S13,07U12,08P3,09E8,12R7,13A4,06N6,04A13,07L12,08S3,09U8,12P7,13E4,06R6,04A13,07N12,08A3,09L8,12S7,13U4,06P6,04E13,07R12,08A3,09N8,12A7,13L4,06S6,04U13,07P12,08E3,09R8,12A7,13N4,06A6,04L13,07S12,08U3,09P8,12E7,13R4,06A6,04N13,07A12,08L3,09S8,12U7,13P4,06E6,04R13,07A12,08N3,09A8,12L"); }, 12000);
    },

    supersuckurdick: function(from, to, message)
    {
        var timeout = anus.waiting(2);

        if(timeout)
        {
            anus.reply('say', from, from, "Can't slap, won't slap. ("+timeout+" seconds remaining)");
            return;
        }

        // Pick a random target
        var target = anus.random_target();

        // Refresh userlist from the server
        anus.client.send('NAMES', '#wetfish');

        // Wait a second
        setTimeout(function()
        {
            // Regenerate target and hope we recieved a NAMES response by now
            target = anus.random_target();

            anus.reply('say', from, to, "9IT'S 3S8U11P4E6R12!9!8 9SUCK UR DICK TIME!");
        }, 1000);


        setTimeout(function() { anus.reply('say', from, to, "fishy opens his mouth!"); }, 3000);
        setTimeout(function() { anus.reply('say', from, to, "HE TAKES THE LOAD..."); }, 6000);
        setTimeout(function() { anus.reply('say', from, to, target+"!"); }, 8000);
        setTimeout(function() { anus.client.send('KICK', to, target, "3S8U11P4E6R10C9O8C4K3S8U11P4E6R10C9O8C4K3S8U11P4E6R10C9O8C4K3S8U11P4E6R10C9O8C4K3S8U11P4E6R10C9O8C4K"); }, 12000);
    },

    superslapaniggasanus: function(from, to, message)
    {
        var timeout = anus.waiting(10);

        if(timeout)
        {
            anus.reply('say', from, from, "Can't slap, won't slap. ("+timeout+" seconds remaining)");
            return;
        }
        
        // Pick a random target
        var target = anus.random_target();

        // Refresh userlist from the server
        anus.client.send('NAMES', '#wetfish');

        // Wait a second
        setTimeout(function()
        {
            // Regenerate target and hope we recieved a NAMES response by now
            target = anus.random_target();

            anus.reply('say', from, to, "1IT'S SUPER SLAP A NIGGAS ANUS TIME!!!");
        }, 1000);

        setTimeout(function() { anus.reply('say', from, to, "This nigga fishy GETS BUCK!"); }, 3000);
        setTimeout(function() { anus.reply('say', from, to, "What it do ...? "); }, 6000);
        setTimeout(function() { anus.reply('say', from, to, target+"!"); }, 8000);
        setTimeout(function() { anus.reply('action', from, to, "slaps 1SUPER SLAPS "+target+"'s BLACK ANUS!"); }, 10000);
        setTimeout(function() { anus.client.send('KICK', to, target, "1THISNIGGASDOWNTHISNIGGASDOWNTHISNIGGASDOWNTHISNIGGASDOWNTHISNIGGASDOWNTHISNIGGASDOWN"); }, 20000);
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
