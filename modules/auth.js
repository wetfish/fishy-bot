var client, core;

var auth =
{
    events: ['registered'],

    registered: function()
    {
        if(core.secrets.nickservPass)
        {
            client.say("NickServ", "login " + core.secrets.nickservPass);
        }
    },

    bind: function()
    {
        for(var i = 0, l = auth.events.length; i < l; i++)
        {
            var event = auth.events[i];
            client.addListener(event, auth[event]);
        }
    },

    unbind: function()
    {
        for(var i = 0, l = auth.events.length; i < l; i++)
        {
            var event = auth.events[i];
            client.removeListener(event, auth[event]);
        }
    }
};

module.exports =
{
    load: function(_client, _core)
    {
        client = _client;
        core = _core;

        auth.bind();
    },
    
    unload: function(_client, _core)
    {
        auth.unbind();
        delete client, core, auth;
    }
}


