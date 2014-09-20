var prompt = require('prompt');
var core = require('../core.js');

var action =
{
    client: false,
    list: ['say', 'load', 'unload', 'reload'],
    
    get: function()
    {
        // Get two properties from the user: action and command
        prompt.get(['action', 'command'], function (err, result)
        {
            // If this is a valid action
            if(action.list.indexOf(result.action) > -1)
            {
                action[result.action](result.command);
            }
            else
            {
                console.log("Invalid action UGH: " + result.action);
            }

            // Prompt the user for more input
            action.get();
        });
    },

    say: function(message)
    {

    },

    load: function(module)
    {
        core.load(module);
    },

    unload: function(module)
    {
        core.unload(module);
    },

    reload: function(module)
    {
        core.reload(module);
    }
};

module.exports =
{
    load: function(client)
    {
        action.client = client;
        
        // Start the prompt
        prompt.start();

        // Start requesting input
        action.get();
    },

    unload: function()
    {
        delete require.cache[require.resolve("prompt")];

        delete prompt;
        delete core;
        delete action;
    }
}
