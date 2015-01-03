var fs = require('fs');

var topic =
{
    // This is a list of topics
    list: [],
    actions: ['log', 'restore', 'replace', 'set', 'append', 'prepend', 'insert', 'delete'],
    client: false,
    core: false,
    user: false,

    // A list of people (or other bots) to ignore from making topic changes
    ignore: ['denice', 'fiolina'],
    
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

    // Helper function to parse topic sections
    parse: function(text)
    {
        var sections = [];
        var pattern = /\[([^\[\]]+)\]/g;
        var match;

        while(match = pattern.exec(text))
        {
            sections.push(match[1].replace(/^[\s\u000f]+|[\s\u000f]+$/g,''));
        }
        
        return sections;
    },

    // Helper function to build topic strings
    build: function(sections)
    {
        var output = [];
        
        for(var i = 0, l = sections.length; i < l; i++)
        {
            // Remove brackets and extra whitespace from new sections
            var section = sections[i].replace(/[\[\]]/g, "");
            section = section.trim();

            // Make sure there's still something left
            if(section.length)
                output.push('[ ' + section + '\u000f ]');
        }

        return output.join(' ');
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
        // Don't process messages from ignored users
        if(topic.ignore.indexOf(from.toLowerCase()) != -1)
            return;
        
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

        var new_topic = {date: new Date(), channel: channel, message: message, set_by: set_by};

        if(set_by == 'fishy' && topic.user)
        {
            new_topic.requested_by = topic.user;
            topic.user = false;
        }
        
        topic.list.push(new_topic);
    },

    log: function(from, to, message)
    {
        var count = parseInt(message);

        // Allow users to specify how many topics they want to see (maximum 50), defaulting to -3
        if(!count || count < 1 || count > 50)
            count = -3;
        else
            count *= -1;
        
        var most_recent = topic.list.slice(count);

        for(var i = 0, l = most_recent.length; i < l; i++)
        {
            var recent = most_recent[i];
            var index = topic.list.indexOf(recent);

            if(typeof recent.requested_by != "undefined")
                recent.user = recent.requested_by;
            else
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

        topic.user = from;
        topic.client.send('TOPIC', '#wetfish', topic.list[index].message);
    },

    replace: function(from, to, message)
    {
        var last = topic.list[topic.list.length - 1];
        var sections = topic.parse(last.message);

        message = message.split(" ");
        var section = parseInt(message.shift());

        // Does the requested section even exist?
        if(typeof sections[section] == "undefined")
        {
            // If not, create a new section
            section = sections.length;
        }

        // Rebuild the user message
        message = message.join(" ");        
        sections[section] = message;

        // Set the new topic
        topic.user = from;
        topic.client.send('TOPIC', '#wetfish', topic.build(sections));
    },

    set: function(from, to, message)
    {
        var delimiter = "|";
        message = message.split(" ");

        // Nothing to do
        if(!message.length)
            return;

        // If a custom delimiter is set
        if(message[0].length == 1 && message[0].match(/[^a-z0-9]/i))
        {
            // Shift it off the array
            delimiter = message.shift();
        }

        message = message.join(" ");
        sections = message.split(delimiter);
        
        topic.user = from;
        topic.client.send('TOPIC', '#wetfish', topic.build(sections));
    },


    append: function(from, to, message)
    {
        var last = topic.list[topic.list.length - 1];
        var sections = topic.parse(last.message);

        var delimiter = "|";
        message = message.split(" ");

        // Nothing to do
        if(!message.length)
            return;

        // If a custom delimiter is set
        if(message[0].length == 1 && message[0].match(/[^a-z0-9]/i))
        {
            // Shift it off the array
            delimiter = message.shift();
        }

        message = message.join(" ");
        sections = sections.concat(message.split(delimiter));
        
        topic.user = from;
        topic.client.send('TOPIC', '#wetfish', topic.build(sections));
    },

    prepend: function(from, to, message)
    {
        var last = topic.list[topic.list.length - 1];
        var sections = topic.parse(last.message);
        var channel = sections.shift();

        var delimiter = "|";
        message = message.split(" ");

        // Nothing to do
        if(!message.length)
            return;

        // If a custom delimiter is set
        if(message[0].length == 1 && message[0].match(/[^a-z0-9]/i))
        {
            // Shift it off the array
            delimiter = message.shift();
        }

        message = message.join(" ");
        sections = message.split(delimiter).concat(sections);

        // Restore the first topic section
        sections.unshift(channel);
        
        topic.user = from;
        topic.client.send('TOPIC', '#wetfish', topic.build(sections));
    },

    insert: function(from, to, message)
    {
        var last = topic.list[topic.list.length - 1];
        var sections = topic.parse(last.message);

        var delimiter = "|";
        message = message.split(" ");

        // Nothing to do
        if(!message.length)
            return;

        var index = parseInt(message.shift());

        // Can't insert somewhere that doesn't exist
        if(!index || index < 1 || index + 1 > sections.length)
            return;

        // If a custom delimiter is set
        if(message[0].length == 1 && message[0].match(/[^a-z0-9]/i))
        {
            // Shift it off the array
            delimiter = message.shift();
        }

        message = message.join(" ");

        // Wow javascript
        Array.prototype.splice.apply(sections, [index, 0].concat(message.split(delimiter)));

        topic.user = from;
        topic.client.send('TOPIC', '#wetfish', topic.build(sections));
    },

    delete: function(from, to, message)
    {
        message = message.split(" ");

        var last = topic.list[topic.list.length - 1];
        var sections = topic.parse(last.message);

        var index = parseInt(message[0]);
        var length = parseInt(message[1]);

        // Can't delete something that doesn't exist
        if(!index || index < 1 || index + 1 > sections.length)
            return;

        if(!length || length < 1)
            length = 1;

        sections.splice(index, length);

        topic.user = from;
        topic.client.send('TOPIC', '#wetfish', topic.build(sections));
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
