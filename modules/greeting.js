/* 
 * Set greetings when users join the channel
 */

var core;
var greeting =
{
    methods: ['message', 'join'],

    message: function(from, to, message, details)
    {
        // Check if the message is a !command
        var parsed = core.helper.parseCommand('!', message);

        if(parsed)
        {
            if(parsed.command == 'greeting' || parsed.command == 'setgreeting')
            {
                core.helper.reply('say', from, to, 'greeting saved!');
            }
        }
    },

    join: function(channel, user, details)
    {
        core.client.say(channel, 'welcome ' + user + ' your custom greeting will be restored soon! ™');
    },
};

module.exports =
{
    load: function(_client, _core)
    {
        core = _core;
        core.helper.bind(greeting.methods, greeting);
    },

    unload: function()
    {
        core.helper.unbind(greeting.methods, greeting);
    }
}
