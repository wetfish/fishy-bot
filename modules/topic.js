var fs = require('fs');

var topic =
{
    // This is a list of topics
    list: [],
    actions: ['log', 'restore', 'set', 'append', 'prepend', 'replace'],
    client: false,
    core: false,
    
    load_log: function(callback)
    {
        try
        {
            var data = fs.readFileSync('logs/topic.log', 'utf8');
            topic.list = JSON.parse(data);
        }
        catch(error)
        {
            console.log("/!\\ Error Reading Logfile /!\\", error);
        }
    },

    save_log: function()
    {
        try
        {
            fs.writeFileSync('logs/topic.log', JSON.stringify(topic.list));
        }
        catch(error)
        {
            console.log("/!\\ Error Saving Logfile /!\\", error);
        }
    },

    // This really should be a core function or something
    reply: function(type, from, to, message)
    {
        // If this is a channel message
        if(to.charAt(0) == '#')
        {
            topic.client[type](to, message);
            console.log("["+to+"] <fishy> "+message);
        }
        // This must be a private message ^_~
        else
        {
            topic.client[type](from, message);
            console.log("["+from+"] <fishy> "+message);
        }
    },

    message: function(from, to, message, details)
    {
        // Fishy's commands are prefixed with :
        if(message.charAt(0) == ":")
        {
            message = message.substr(1);
            message = message.split(' ');

            var command = message.shift();
            var action = message.shift();

            // If this command is valid
            if(command == 'topic' && topic.actions.indexOf(action) > -1)
            {
                message = message.join(' ');
                topic[action](from, to, message);
            }
        }
    },

    change: function(channel, message, set_by)
    {
        if(topic.list.length)
        {
            var last = topic.list[topic.list.length - 1];

            // Don't push duplicate topics to the list
            if(channel == last.channel && message == last.message && set_by  == last.set_by)
                return;
        }

        topic.list.push({date: new Date(), channel: channel, message: message, set_by: set_by});
    },

    log: function(from, to, message)
    {
        var most_recent = topic.list.slice(-3);

        for(var i = 0, l = most_recent.length; i < l; i++)
        {
            var recent = most_recent[i];
            var index = topic.list.indexOf(recent);
            
            recent.user = recent.set_by.split('!')[0];
            topic.client.say(from, recent.user+" set "+recent.channel+"'s topic to "+recent.message+"\u000f [#"+index+"]");
        }
    },

    restore: function(from, to, message)
    {
        var index = parseInt(message);

        // If an invalid topic ID is passed (or no topic ID at all)
        if(typeof topic.list[index] == "undefined")
        {
            // Use most recent topic before the current
            index = topic.list.length - 2;
        }

        topic.client.send('TOPIC', '#wetfish', topic.list[index].message);
    },

    set: function(from, to, message)
    {
        
    },

    append: function(from, to, message)
    {
        
    },

    prepend: function(from, to, message)
    {
        
    },

    replace: function(from, to, message)
    {
        
    },

    bind: function()
    {
        topic.client.addListener('message', topic.message);
        topic.client.addListener('topic', topic.change);
    },

    unbind: function()
    {
        topic.client.removeListener('message', topic.message);
        topic.client.removeListener('topic', topic.change);
    }
}

module.exports =
{
    load: function(client, core)
    {
        // Read topic list from saved file
        topic.load_log();

        topic.client = client;
        topic.core = core;
        topic.bind();
    },

    unload: function()
    {
        // Save topic list into file
        topic.save_log();

        topic.unbind();
        delete topic;
    },
}
