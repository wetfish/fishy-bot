var admin =
{
    // This is a list of admins
    list: ['rachel@unicorn.sparkle.princess', 'svchost@madmin.madtown'],
    commands: ['say', 'ctcp', 'load', 'unload', 'reload', 'quit'],
    client: false,
    core: false,
    
    // Accept commands from admin input!
    // Based on user/hostname
    // :reload admin
    // :say butts!

    // This really should be a core function or something
    reply: function(type, from, to, message)
    {
        // If this is a channel message
        if(to.charAt(0) == '#')
        {
            admin.client[type](to, message);
            console.log("["+to+"] <fishy> "+message);
        }
        // This must be a private message ^_~
        else
        {
            admin.client[type](from, message);
            console.log("["+from+"] <fishy> "+message);
        }
    },

    message: function(from, to, message, details)
    {
        var userhost = details.nick + '@' + details.host;

        // If this user appears in the admin list
        if(admin.list.indexOf(userhost) > -1)
        {
            // Admin commands are prefixed with :
            if(message.charAt(0) == ":")
            {
                message = message.substr(1);
                message = message.split(' ');

                var command = message.shift();

                // If this command is valid
                if(admin.commands.indexOf(command) > -1)
                {
                    message = message.join(' ');
                    admin[command](from, to, message);
                }
            }
        }
    },

    // This function determines module type based on user input
    parse_module: function(module)
    {
        module = module.split(' ');

        if(module[0] == 'core')
            return {type: 'core', name: module[1]};
        else if(module[1] == 'module')
            return {type: 'modules', name: module[1]};
        else
            return {type: 'modules', name: module[0]};
    },

    say: function(from, to, message)
    {
        admin.reply('say', from, to, message);
    },

    // Send a CTCP message
    ctcp: function(from, to, message)
    {
        message = message.split(' ');
        var target = message.shift();
        var type = message.shift();
        message = message.join(' ');

        admin.client.ctcp(target, type, message);
    },

    load: function(from, to, module)
    {
        module = admin.parse_module(module);
        admin.reply('say', from, to, 'Loading ' + module.name + ' module...');
        admin.core.load(module);
    },

    unload: function(from, to, module)
    {
        module = admin.parse_module(module);
        admin.reply('say', from, to, 'Unloading ' + module.name + ' module...');
        admin.core.unload(module);
    },

    reload: function(from, to, module)
    {
        module = admin.parse_module(module);
        admin.reply('say', from, to, 'Reloading ' + module.name + ' module...');
        admin.core.reload(module);
    },

    quit: function(from, to, module)
    {
        admin.reply('say', from, to, 'Bye bye!');
        require('process').exit();
    },

    bind: function()
    {
        admin.client.addListener('message', admin.message);
    },

    unbind: function()
    {
        admin.client.removeListener('message', admin.message);
    }
}

module.exports =
{
    load: function(client, core)
    {
        admin.client = client;
        admin.core = core;
        admin.bind();
    },

    unload: function()
    {
        admin.unbind();
        delete admin;
    },
}
