/* 
 * Set greetings when users join the channel
 */

var core;
var model;

var greeting =
{
    methods: ['message', 'join'],

    message: function(from, to, message, details)
    {
        // Don't do anything if we're not connected to the database
        if(!model.connected)
        {
            return;
        }
        
        // Check if the message is a !command
        var parsed = core.helper.parseCommand('!', message);

        if(parsed)
        {
            if(parsed.command == 'greeting' || parsed.command == 'setgreeting')
            {
                model.connection.query('Replace into `greetings` values(?, ?)', [from, parsed.message]);
                core.helper.reply('say', from, to, 'greeting saved!');
            }
        }
    },

    join: function(channel, user, details)
    {
        if(!model.connected)
        {
            return;
        }

        model.connection.query('Select `greeting` from `greetings` where `user` = ?', user, function(error, response)
        {
            // Make sure there wasn't an error and the greeting is not null
            if(!error && response.length && response[0].greeting)
            {
                core.helper.reply('say', user, channel, response[0].greeting);
            }
        });
    },
};

module.exports =
{
    load: function(_client, _core)
    {
        core = _core;
        model = core.model;
        core.helper.bind(greeting.methods, greeting);
    },

    unload: function()
    {
        core.helper.unbind(greeting.methods, greeting);
    }
}
