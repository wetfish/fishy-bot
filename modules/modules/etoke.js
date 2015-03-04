var client, core;

var toke =
{
    events: ['message'],

    message: function(from, to, message)
    {
        if(message == "!etoke")
        {
            client.say(to, "420 blaze it");
        }
    },

    bind: function()
    {
        for(var i = 0, l = toke.events.length; i < l; i++)
        {
            var event = toke.events[i];
            client.addListener(event, toke[event]);
        }
    },

    unbind: function()
    {
        for(var i = 0, l = toke.events.length; i < l; i++)
        {
            var event = toke.events[i];
            client.removeListener(event, toke[event]);
        }
    }
};

module.exports =
{
    load: function(_client, _core)
    {
        client = _client;
        core = _core;

        toke.bind();
    },
    
    unload: function(_client, _core)
    {
        toke.unbind();
        delete client, core, toke;
    }
}


