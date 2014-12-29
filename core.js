var fs = require('fs');

// Core functions for loading and reloading modules
module.exports = (function()
{
    var core =
    {
        // Define core variables
        client: false,
        secrets: false,
        loaded: {},

        // Get core functions
        functions: require("./config/core.js"),

        init: function(client, modules, secrets)
        {
            core.secrets = secrets;
            
            // Only set the client if it hasn't been initialized yet
            if(!core.client)
                core.client = client;

            // Add requested modules to the core functions list
            core.functions = core.functions.concat(modules);

            for(var i = 0, l = core.functions.length; i < l; i++)
            {
                core.load(core.functions[i]);
            }
        },

        load: function(module)
        {
            var path = false;

            // Make sure the module exists!
            if(fs.existsSync("./core/"+module+".js"))
            {
                path = "./core/"+module+".js";
            }
            else if(fs.existsSync("./modules/"+module+".js"))
            {
                path = "./modules/"+module+".js";
            }
                
            if(path)
            {
                core.loaded[module] = require(path);

                // Make sure the loaded module has a load function
                if(typeof core.loaded[module].load == "function")
                {
                    core.loaded[module].load(core.client, core);
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
                delete require.cache[require.resolve("./core/"+module+".js")];
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
