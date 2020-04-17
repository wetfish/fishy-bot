var readline = require('readline');

var prompt =
{
    readline: false,
    client: false,
    core: false,

    // List of valid actions
    list: ['say', 'ctcp', 'load', 'unload', 'reload', 'quit'],

    // Handler for user input
    handle: function(line)
    {
        var line = line.split(' ');
        var action = line.shift();
        var command = line.join(' ');

        if(action && command)
        {
            // If this is a valid action
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
    },

    // This function determines module type based on user input
    parse_module: function(module)
    {
        module = module.split(' ');

        if(module[0] == 'core')
            return {type: 'core', name: module[1]};
        else if(module[0] == 'module')
            return {type: 'modules', name: module[1]};
        else
            return {type: 'modules', name: module[0]};
    },

    // Send a message
    say: function(message)
    {
        message = message.split(' ');
        var destination = message.shift();
        message = message.join(' ');
        
        prompt.client.say(destination, message);
    },

    // Send a CTCP message
    ctcp: function(message)
    {
        message = message.split(' ');
        var target = message.shift();
        var type = message.shift();
        message = message.join(' ');

        prompt.client.ctcp(target, type, message);
    },

    // Load a module
    load: function(module)
    {
        module = prompt.parse_module(module);
        prompt.core.load(module);
    },

    // Unload a module
    unload: function(module)
    {
        module = prompt.parse_module(module);
        prompt.core.unload(module);
    },

    // Reload a module
    reload: function(module)
    {
        module = prompt.parse_module(module);
        prompt.core.reload(module);
    },

    // Shut down the bot
    quit: function(from, to, module)
    {   
	console.log('See ya laterrrr!');
        require('process').exit();
    },
};

module.exports =
{
    // This function is called when this module is loaded
    load: function(client, core)
    {
        prompt.client = client;
        prompt.core = core;
        
        // Start the readline interface
        prompt.readline = readline.createInterface(process.stdin, process.stdout);
     
        // Start requesting input
        prompt.readline.on('line', function(line)
        {
            prompt.handle(line);
        });
    },

    // This function is called when this module is unloaded
    unload: function()
    {
        // Stop requesting input
        prompt.readline.close();

        // Clean up variables
        delete readline;
        delete prompt;
    }
}
