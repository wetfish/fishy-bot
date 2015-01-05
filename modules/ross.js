/* Random ross quotes
 *
 * oh whatever
 * anywho
 * No
 * No
 * No.
 * Look.
 */

var ross =
{
    client: false,
    methods: ['message', 'action'],

    message: function(from, to, message, details)
    {
        if(from == "denice" && to == "#wetfish" && message == "Now hating ross")
        {
            ross.client.say(to, "!hateross");
        }
    },

    action: function(from, to, message, details)
    {
        // do nothing lol
    },

    bind: function()
    {
        for(var i = 0, l = ross.methods.length; i < l; i++)
        {
            var method = ross.methods[i];
            ross.client.addListener(method, ross[method]);
        }
    },

    unbind: function()
    {
        for(var i = 0, l = ross.methods.length; i < l; i++)
        {
            var method = ross.methods[i];
            ross.client.removeListener(method, ross[method]);
        }
    }
};

module.exports =
{
    load: function(client)
    {
        ross.client = client;
        ross.bind();
    },

    unload: function()
    {
        ross.unbind();
        delete ross;
    }
}
