var fs = require('fs');

// Core functions for loading and reloading modules
module.exports = (function()
{
    var core =
    {
        client: false,
        loaded: {},

        init: function(client, modules)
        {
            // Only set the client if it hasn't been initialized yet
            if(!core.client)
                core.client = client;

            for(var i = 0, l = modules.length; i < l; i++)
            {
                core.load(modules[i]);
            }
        },

        load: function(module)
        {
            // Make sure the module exists!
            if(fs.existsSync("./modules/"+module+".js"))
            {
                core.loaded[module] = require("./modules/"+module+".js");

                // Make sure the loaded module has a load function
                if(typeof core.loaded[module].load == "function")
                {
                    core.loaded[module].load(core, core.client);
                }
                else
                {
                    console.log("Warning: Module '"+module+"' cannot be loaded!");
                }
            }
            else
            {
                console.log("Warning: Module '"+module+"' does not exist!");
            }
        },

        unload: function(module)
        {
            // Make sure this module is actually loaded
            if(typeof core.loaded[module] != "undefined")
            {
                // Make sure the loaded module has a load function
                if(typeof core.loaded[module].unload == "function")
                {
                    core.loaded[module].unload();
                }
                else
                {
                    console.log("Warning: Module '"+module+"' cannot be unloaded!");
                }
                
                delete core.loaded[module];
                delete require.cache[require.resolve("./modules/"+module+".js")];
            }
        },

        reload: function(module)
        {
            core.unload(module);
            core.load(module);
        }
    };

    return {
        init: core.init,
        load: core.load,
        unload: core.unload,
        reload: core.reload
    };
})();
