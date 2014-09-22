var readline = require('readline');

var prompt =
{
    readline: false,
    core: false,
    client: false,
    list: ['say', 'load', 'unload', 'reload'],
    
    handle: function(line)
    {
        var line = line.split(' ');
        var action = line.shift();
        var command = line.join(' ');

        if(action && command)
        {
            // If this is a valid prompt
            if(prompt.list.indexOf(action) > -1)
            {
                prompt[action](command);
            }
            else
            {
                console.log("Invalid action: " + action);
            }
        }
        else
        {
            console.log("You must specify an action and a command, for example: say hi");
        }

        prompt.readline.prompt(true);
    },

    say: function(message)
    {
        console.log("Say: " + message);
    },

    load: function(module)
    {
        prompt.core.load(module);
    },

    unload: function(module)
    {
        prompt.core.unload(module);
    },

    reload: function(module)
    {
        prompt.core.reload(module);
    }
};

module.exports =
{
    load: function(core, client)
    {
        prompt.core = core;
        prompt.client = client;
        
        // Start the readline interface
        prompt.readline = readline.createInterface(process.stdin, process.stdout);
     
        // Start requesting input
        prompt.readline.prompt(true);
        prompt.readline.on('line', function(line)
        {
            prompt.handle(line);
        });
    },

    unload: function()
    {
        prompt.readline.close();
        
        delete readline;
        delete prompt;
    }
}
