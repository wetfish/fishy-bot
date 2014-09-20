// Core functions for loading and reloading modules

module.exports = (function()
{
    var core =
    {
        client: false,

        init: function(client, modules)
        {
            // Only set the client if it hasn't been initialized yet
            if(!core.client)
                core.client = client;

            
        },

        load: function(module)
        {

        },

        unload = function(module)
        {

        },

        reload = function(module)
        {

        }
    };

    return
    {
        init: core.init,
        load: core.load,
        unload: core.unload,
        reload: core.reload
    };
})();
