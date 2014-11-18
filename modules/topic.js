var topic =
{
    // This is a list of topics
    list: [],
    actions: ['log', 'restore', 'set', 'append', 'prepend', 'replace'],
    client: false,
    core: false,
    

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
        topic.list.push({channel: channel, message: message, set_by: set_by});
    },

    log: function(from, to, message)
    {
        console.log("---------", from, to, "---------")
        console.log(topic.list);
    },

    restore: function(from, to, message)
    {
        
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
        topic.client = client;
        topic.core = core;
        topic.bind();
    },

    unload: function()
    {
        topic.unbind();
        delete topic;
    },
}
