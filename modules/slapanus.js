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
    // This is a list of anuss
    list: ['rachel@unicorn.sparkle.princess', 'svchost@manus.madtown'],
    commands: ['slapanus', 'superslapanus'],
    client: false,
    core: false,
    
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
        // This must be a private message ^_~
        else
        {
            anus.client[type](from, message);
            console.log("["+from+"] <fishy> "+message);
        }
    },

    message: function(from, to, message, details)
    {
        var userhost = details.nick + '@' + details.host;

        // If this user appears in the anus list
        if(anus.list.indexOf(userhost) > -1)
        {
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
        }
    },

    slapanus: function(from, to, message)
    {
        anus.reply('say', from, to, message);
    },

    superslapanus: function(from, to, module)
    {
        anus.reply('say', from, to, 'Loading ' + module + ' module...');
        anus.core.load(module);
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
    },
}
