/* 
 * Save and display quotes from the channel
 */

var core;
var quote =
{
    methods: ['message'],

    message: function(from, to, message, details)
    {
        // Check if the message is a !command
        var parsed = core.helper.parseCommand('!', message);

        if(parsed)
        {
            if(parsed.command == 'quote')
            {
                core.helper.reply('say', from, to, "[#1337] [2017-4-20 @ 03:36] <%fishy> new quote feature coming soon! ™");
            }
        }
    },
};

module.exports =
{
    load: function(_client, _core)
    {
        core = _core;
        core.helper.bind(quote.methods, quote);
    },

    unload: function()
    {
        core.helper.unbind(quote.methods, quote);
    }
}
