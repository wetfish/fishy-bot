/* 
 * Use the toilet command to generate rainbow text!
 */

var rainbow =
{
    client: false,
    methods: ['message'],
    commands: ['rainbow', 'bigrainbow', 'biggerrainbow'],

    // This really should be a core function or something
    reply: function(type, from, to, message)
    {
        // If this is a channel message
        if(to.charAt(0) == '#')
        {
            rainbow.client[type](to, message);
            console.log("["+to+"] <fishy> "+message);
        }
        else
        {
            rainbow.client[type](from, message);
            console.log("["+from+"] <fishy> "+message);
        }
    },

    message: function(from, to, message, details)
    {
        // rainbow commands are prefixed with !
        if(message.charAt(0) == "!")
        {
            message = message.substr(1);
            message = message.split(' ');

            var command = message.shift().toString().toLowerCase();

            // If this command is valid
            if(rainbow.commands.indexOf(command) > -1)
            {
                message = message.join(' ');
                rainbow[command](from, to, message, details);
            }
        }
    },

    rainbow: function(from, to, message, details)
    {
        rainbow.reply('say', from, to, 'coming soon ™');
    },

    bigrainbow: function(from, to, message, details)
    {
        rainbow.reply('say', from, to, 'coming soon ™');
    },

    biggerrainbow: function(from, to, message, details)
    {
        rainbow.reply('say', from, to, 'coming soon ™');
    },

    bind: function()
    {
        rainbow.client.addListener('message', rainbow.message);
    },

    unbind: function()
    {
        rainbow.client.removeListener('message', rainbow.message);
    }
};

module.exports =
{
    load: function(client)
    {
        rainbow.client = client;
        rainbow.bind();
    },

    unload: function()
    {
        rainbow.unbind();
        delete rainbow;
    }
}
