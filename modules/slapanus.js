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
    commands: ['slapanus', 'superslapanus', 'superslapanusv2', 'supersuckurdick', 'superslapaniggasanus', 'superslapsiesta', 'superslapbaka'],
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

    // Build list of users
    get_users: function()
    {
        anus.users = [];
        
        for(var i = 0, keys = Object.keys(anus.client.chans['#wetfish'].users), l = keys.length; i < l; ++i)
        {
            var user = keys[i];

            // Don't slap yourself
            if(user != "fishy")
                anus.users.push(user);
        }

    },

    random_target: function(from, message)
    {
        anus.get_users();
        
        // If there's a potential target
        if(message)
        {
            var message = message.split(' ');
            var action = crypto.randomBytes(1).readUInt8(0) % 3;

            // Attack the target
            if(action == 0)
            {
                // If the target doesn't exist
                if(anus.users.indexOf(message[0]) < 0)
                    return from;

                return message[0];
            }
            
            // Attack the caster
            else if(action == 1)
                return from;

            // Else, use the default behavior
        }
        
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
        var target = anus.random_target(from, message);

        // Queue actions
        setTimeout(function() { anus.reply('say', from, to, "4It's Anus Slapping Time!"); }, 1000);
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
        var target = anus.random_target(from, message);

        // Queue actions
        setTimeout(function() { anus.reply('say', from, to, "4IT'S 3S8U11P4E6R12!9!8 4ANUS SLAPPING TIME!"); }, 1000);
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
        var target = anus.random_target(from, message);

        // Queue actions
        setTimeout(function() { anus.reply('say', from, to, "6,4I13,07T12,08S3,09 8,12S7,13U4,06P6,04E13,07R12,08 3,09S8,12L7,13A4,06P6,04 13,07A12,08N3,09U8,12S7,13 4,06v6,04213,07 12,08!3,09!8,12!7,13!4,06!6,04!13,07!12,08!3,09!"); }, 1000);
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
            anus.reply('say', from, from, "Can't suck, won't suck. ("+timeout+" seconds remaining)");
            return;
        }

        // Pick a random target
        var target = anus.random_target(from, message);

        // Queue actions
        setTimeout(function() { anus.reply('say', from, to, "9IT'S 3S8U11P4E6R12!9!8 9SUCK UR DICK TIME!"); }, 1000);
        setTimeout(function() { anus.reply('say', from, to, from+" opens his mouth!"); }, 3000);
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
        var target = anus.random_target(from, message);

        // Queue actions
        setTimeout(function() { anus.reply('say', from, to, "1IT'S SUPER SLAP A NIGGAS ANUS TIME!!!"); }, 1000);
        setTimeout(function() { anus.reply('say', from, to, "This nigga fishy GETS BUCK!"); }, 3000);
        setTimeout(function() { anus.reply('say', from, to, "What it do ...? "); }, 6000);
        setTimeout(function() { anus.reply('say', from, to, target+"!"); }, 8000);
        setTimeout(function() { anus.reply('action', from, to, " 1SUPER SLAPS "+target+"'s BLACK ANUS!"); }, 10000);
        setTimeout(function() { anus.client.send('KICK', to, target, "1THISNIGGASDOWNTHISNIGGASDOWNTHISNIGGASDOWNTHISNIGGASDOWNTHISNIGGASDOWNTHISNIGGASDOWN"); }, 20000);
    },

    superslapsiesta: function(from, to, message)
    {
        var slaps =
        [
            '11¡02S12Ú06P13E05R 04B07O08F03E09T10A11D02A 12A06N13O 05N04O 07M08Á03S 09L10E11C02H12E 06M13A05T04E07R08N03A09!',
            '10¡11S02Ú12P06E13R 05B04O07F08E03T09A10D11A 02A12N06O 13N05O 04M07Á08S 03L09E10C11H02E 12M06A13T05E04R07N08A03!',
            '09¡10S11Ú02P12E06R 13B05O04F07E08T03A09D10A 11A02N12O 06N13O 05M04Á07S 08L03E09C10H11E 02M12A06T13E05R04N07A08!',
            '03¡09S10Ú11P02E12R 06B13O05F04E07T08A03D09A 10A11N02O 12N06O 13M05Á04S 07L08E03C09H10E 11M02A12T06E13R05N04A07!'
        ];

        var timeout = anus.waiting(0.5);
        
        if(timeout)
        {
            // TODO: Translate to spanish?
            anus.reply('say', from, from, "Can't slap, won't slap. ("+timeout+" seconds remaining)");
            return;
        }
        
        // Pick a random target
        var target = anus.random_target(from, message);

        // Pick a random slap
        var slap = crypto.randomBytes(1).readUInt8(0) % 4;

        // Queue actions
        setTimeout(function() { anus.reply('say', from, to, "4¡SU ANO 10S11Ú02P12E06R4 BOFETADA TIEMPO!"); }, 1000);
        setTimeout(function() { anus.reply('say', from, to, from+" escupe en el suelo!"); }, 3000);
        setTimeout(function() { anus.reply('say', from, to, "la saliva lee .."); }, 6000);
        setTimeout(function() { anus.reply('say', from, to, target+"!"); }, 8000);
        setTimeout(function() { anus.reply('action', from, to, "05S04Ú07P08E03R abofetea "+target+" ano!!"); }, 10000);
        setTimeout(function() { anus.client.send('KICK', to, target, slaps[slap]); }, 12000);
    },

    superslapbaka: function(from, to, message)
    {
        var timeout = anus.waiting(2);
        
        if(timeout)
        {
            // TODO: Translate to japanese?
            anus.reply('say', from, from, "Can't slap, won't slap. ("+timeout+" seconds remaining)");
            return;
        }
        
        // Pick a random target
        var target = anus.random_target(from, message);

        // Queue actions
        setTimeout(function() { anus.reply('say', from, to, "4Sūpa kōmon tataki no jikandesu!"); }, 1000);
        setTimeout(function() { anus.reply('say', from, to, from+" wa yuka ni haku!"); }, 3000);
        setTimeout(function() { anus.reply('say', from, to, "Daeki dokusho..."); }, 6000);
        setTimeout(function() { anus.reply('say', from, to, target+"!"); }, 8000);
        setTimeout(function() { anus.reply('action', from, to, "wa SUUPAA!! "+target+" no kōmon o tataku!!"); }, 10000);
        setTimeout(function() { anus.client.send('KICK', to, target, "SUPAAOSHIRISUPAAOSHIRISUUPAOSHIRISUUPAOSHIRISUUPAOSHIRI"); }, 12000);
    },

    bind: function()
    {
        anus.client.addListener('message', anus.message);
    },

    unbind: function()
    {
        anus.client.removeListener('message', anus.message);
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
