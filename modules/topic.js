var fs = require('fs');

var topic =
{
    // An object which lists topics by channel
    list: {version: 1},
    actions: ['log', 'restore', 'replace', 'set', 'append', 'prepend', 'insert', 'delete', 'help'],
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
                // Check if a channel is specified in the command
                // Make sure the length is > 1, otherwise this might be a delimiter!
                if(message[0] && message[0].indexOf('#') ==  0 && message[0].length > 1)
                {
                    to = message.shift();
                }
                
                message = message.join(' ');
                topic[action](from, to, message);
            }
        }
    },

    change: function(channel, message, set_by)
    {
        if(typeof topic.list[channel] == "undefined")
        {
            topic.list[channel] = [];
        }

        var list = topic.list[channel];
        
        if(list.length)
        {
            var last = list[list.length - 1];

            // Don't push duplicate topics to the list
            if(message == last.message && set_by  == last.set_by)
                return;
        }

        var new_topic = {date: new Date(), message: message, set_by: set_by};

        if(set_by == 'fishy' && topic.user)
        {
            new_topic.requested_by = topic.user;
            topic.user = false;
        }
        
        list.push(new_topic);
    },

    log: function(from, channel, message)
    {
        // Make sure this command has a valid channel
        if(channel.indexOf('#') != 0)
        {
            topic.client.say(from, "You must use :topic log in a channel, or use :topic log [channel].");
            return;
        }

        if(typeof topic.list[channel] == "undefined")
        {
            topic.client.say(from, "No topic log exists for " + channel);
            return;
        }
 
        var count = parseInt(message);

        // Allow users to specify how many topics they want to see (maximum 50), defaulting to -3
        if(!count || count < 1 || count > 50)
            count = -3;
        else
            count *= -1;
        
        var most_recent = topic.list[channel].slice(count);

        for(var i = 0, l = most_recent.length; i < l; i++)
        {
            var recent = most_recent[i];
            var index = topic.list[channel].indexOf(recent);

            if(typeof recent.requested_by != "undefined")
                recent.user = recent.requested_by;
            else
                recent.user = recent.set_by.split('!')[0];
                
            topic.client.say(from, recent.user+" set "+channel+"'s topic to "+recent.message+"\u000f [#"+index+"]");
        }
    },

    restore: function(from, channel, message) 
    {
        // Make sure this command has a valid channel
        if(channel.indexOf('#') != 0)
        {
            topic.client.say(from, "You must use :topic restore in a channel, or use :topic restore [channel].");
            return;
        }

        if(typeof topic.list[channel] == "undefined")
        {
            topic.client.say(from, "No topic log exists for " + channel);
            return;
        }

        var index = parseInt(message);

        // If an invalid topic ID is passed (or no topic ID at all)
        if(typeof topic.list[channel][index] == "undefined")
        {
            // Use most recent topic before the current
            index = topic.list[channel].length - 2;
        }

        topic.user = from;
        topic.client.send('TOPIC', channel, topic.list[channel][index].message);
    },

    replace: function(from, channel, message)
    {
        // Make sure this command has a valid channel
        if(channel.indexOf('#') != 0)
        {
            topic.client.say(from, "You must use :topic replace in a channel, or use :topic replace [channel].");
            return;
        }

        if(typeof topic.list[channel] == "undefined")
        {
            topic.client.say(from, "No topic log exists for " + channel);
            return;
        }

        var index = topic.list[channel].length - 1;
        var last = topic.list[channel][index];
        var sections = topic.parse(last.message);

        message = message.split(" ");
        var section = parseInt(message.shift()) - 1;

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
        topic.client.send('TOPIC', channel, topic.build(sections));
    },

    set: function(from, channel, message)
    {
        // Make sure this command has a valid channel
        if(channel.indexOf('#') != 0)
        {
            topic.client.say(from, "You must use :topic set in a channel, or use :topic set [channel].");
            return;
        }
        
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
        topic.client.send('TOPIC', channel, topic.build(sections));
    },


    append: function(from, channel, message)
    {
        // Make sure this command has a valid channel
        if(channel.indexOf('#') != 0)
        {
            topic.client.say(from, "You must use :topic append in a channel, or use :topic append [channel].");
            return;
        }

        if(typeof topic.list[channel] == "undefined")
        {
            topic.client.say(from, "No topic log exists for " + channel);
            return;
        }

        var index = topic.list[channel].length - 1;
        var last = topic.list[channel][index];
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
        topic.client.send('TOPIC', channel, topic.build(sections));
    },

    prepend: function(from, channel, message)
    {
        // Make sure this command has a valid channel
        if(channel.indexOf('#') != 0)
        {
            topic.client.say(from, "You must use :topic prepend in a channel, or use :topic prepend [channel].");
            return;
        }

        if(typeof topic.list[channel] == "undefined")
        {
            topic.client.say(from, "No topic log exists for " + channel);
            return;
        }
        
        var index = topic.list[channel].length - 1;
        var last = topic.list[channel][index];
        var sections = topic.parse(last.message);
        var first = sections.shift();

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
        sections.unshift(first);
        
        topic.user = from;
        topic.client.send('TOPIC', channel, topic.build(sections));
    },

    insert: function(from, channel, message)
    {
        // Make sure this command has a valid channel
        if(channel.indexOf('#') != 0)
        {
            topic.client.say(from, "You must use :topic insert in a channel, or use :topic insert [channel].");
            return;
        }

        if(typeof topic.list[channel] == "undefined")
        {
            topic.client.say(from, "No topic log exists for " + channel);
            return;
        }
        
        var index = topic.list[channel].length - 1;
        var last = topic.list[channel][index];
        var sections = topic.parse(last.message);

        var delimiter = "|";
        message = message.split(" ");

        // Nothing to do
        if(!message.length)
            return;

        var index = parseInt(message.shift()) - 1;

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
        topic.client.send('TOPIC', channel, topic.build(sections));
    },
    
    delete: function(from, channel, message)
    {
        // Make sure this command has a valid channel
        if(channel.indexOf('#') != 0)
        {
            topic.client.say(from, "You must use :topic delete in a channel, or use :topic delete [channel].");
            return;
        }

        if(typeof topic.list[channel] == "undefined")
        {
            topic.client.say(from, "No topic log exists for " + channel);
            return;
        }
        
        message = message.split(" ");

        var lastIndex = topic.list[channel].length - 1;
        var last = topic.list[channel][lastIndex];
        var sections = topic.parse(last.message);

        var index = parseInt(message[0]) - 1;
        var length = parseInt(message[1]);

        // Can't delete something that doesn't exist
        if(!index || index < 1 || index + 1 > sections.length)
            return;

        if(!length || length < 1)
            length = 1;

        sections.splice(index, length);

        topic.user = from;
        topic.client.send('TOPIC', channel, topic.build(sections));
    },

    help: function(from, to)
    {
        //init documentu sendy
        topic.client.send('PRIVMSG', from, ':topic help! hi!');
        topic.client.send('PRIVMSG', from, '  :topic log [count] -- pms a list of the last 3 topics, or user requested count');
        topic.client.send('PRIVMSG', from, '  :topic restore [log id] -- restores last topic (or optional id from the log list)');
        topic.client.send('PRIVMSG', from, '  :topic replace [section id] [text] -- Replace a section of the current topic with new text');
        topic.client.send('PRIVMSG', from, '  :topic set [delimiter] [text] -- Sets text as the topic, broken into sections delimited by a user specified delimiter or the default value of |');
        topic.client.send('PRIVMSG', from, '  :topic delete [index] [count] -- Delete a section of the topic');
        topic.client.send('PRIVMSG', from, '  :topic append [delimiter] [text] -- Append new sections to the topic');
        topic.client.send('PRIVMSG', from, '  :topic prepend [delimiter] [text] -- Prepend new sections to the topic');
        topic.client.send('PRIVMSG', from, '  :topic insert [index] [delimiter] [text] -- Create a new section at a specific location in the topic');

        topic.client.send('PRIVMSG', from, '--end of response');
    },

    // Function for converting topic logs from older formats
    fix: function(from, to, message)
    {
        // Originally topics were stored in an array
        if(Array.isArray(topic.list))
        {
            topic.client.say(from, "Fixing topic history...");

            var fixed = {};

            // Loop through array and build an object sorted by channel
            for(var i = 0, l = topic.list.length; i < l; i++)
            {
                var old = topic.list[i];
                var channel = old.channel;
                delete old.channel;

                if(typeof fixed[channel] == "undefined")
                {
                    fixed[channel] = [];
                }

                fixed[channel].push(old);
            }

            // Set version number
            fixed.version = 1;

            // Save fixed topic list
            topic.list = fixed;

            topic.client.say(from, "Topic history fixed!");
        }
        else if(topic.list.version == 1)
        {
            topic.client.say(from, "Nothing to fix!");
        }
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
