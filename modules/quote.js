/* 
 * Save and display quotes from the channel
 */

var core;
var model;
var extend = require('extend');

var quote =
{
    events: ['message'],
    functions: ['add', 'blame', 'latest', 'delete', 'like', 'dislike', 'popular'],

    message: function(from, to, message, details)
    {
        // Check if the message is a !command
        var parsed = core.helper.parseCommand('!', message);

        if(parsed)
        {
            if(parsed.command == 'quote')
            {
                // Save where this message came from
                var source = {'from': from, 'to': to, 'details': details};

                // Check the first chunk for a matching quote function
                var option = parsed.chunks.shift();

                if(quote.functions.indexOf(option) > -1)
                {
                    // Pass the remaining message data to the quote function
                    var argument = parsed.chunks.join(' ');
                    quote[option](argument, source);
                }

                // Check if the user is searching for a specific quote ID
                else if(option && option.match(/^#?[0-9]+$/))
                {
                    quote.get(option, source);
                }

                // Otherwise, this must be a quote search
                else
                {
                    quote.random({'search': option}, source);
                }
            }
        }
    },

    // Helper function to control the output of quotes
    output: function(data, source)
    {
        var date = data.created_at.toISOString().replace(/T([0-9]+:[0-9]+):[0-9].*$/, function(string, minutes)
        {
            return ' @ ' + minutes;
        });

        core.helper.reply('say', source.from, source.to, "[\x02#" + data.id + "\x02] [\x02" + date + "\x02] " + data.quote);
    },

    // Add a quote to the database
    add: function(quote, source)
    {
        quote = quote.trim();

        if(quote)
        {
            model.connection.query('Insert into `quotes` (quote, created_by) values(?, ?)', [quote, source.from]);
            core.helper.reply('say', source.from, source.to, "quote added!");
        }
        else
        {
            core.helper.reply('say', source.from, source.to, "nothing to say?");
        }
    },

    // Display a quote based on its quote ID
    get: function(id, source)
    {
        // Remove any non-numeric characters
        id = id.replace(/[^0-9]/g, '');

        model.connection.query('Select * from `quotes` where `id` = ?', id, function(error, response)
        {
            // Make sure there wasn't an error
            if(!error && response.length)
            {
                quote.output(response[0], source);
            }
            else
            {
                core.helper.reply('say', source.from, source.to, "no quote found");
            }
        });
    },

    // Display who added this quote to the database
    blame: function(id, source)
    {
        model.connection.query('Select `created_by` from `quotes` where `id` = ?', id, function(error, response)
        {
            // Make sure there wasn't an error
            if(!error && response.length)
            {
                core.helper.reply('say', source.from, source.to, "you can blame \x02" + response[0].created_by + "\x02 for that one");
            }
            else
            {
                core.helper.reply('say', source.from, source.to, "no quote found");
            }
        });
    },

    // Get the latest quote
    latest: function(id, source)
    {
        model.connection.query('Select * from `quotes` order by `id` desc limit 0,1', function(error, response)
        {
            // Make sure there wasn't an error
            if(!error && response.length)
            {
                quote.output(response[0], source);
            }
            else
            {
                core.helper.reply('say', source.from, source.to, "something bad happened");
            }
        });
    },

    // Allows admins to delete a quote
    delete: function(id, source)
    {
        core.helper.reply('say', source.from, source.to, "this feature is coming soon ™");
    },

    // Increase the score of a quote
    like: function(id, source)
    {
        core.helper.reply('say', source.from, source.to, "this feature is coming soon ™");
    },

    // Reduce the score of a quote
    dislike: function(id, source)
    {
        core.helper.reply('say', source.from, source.to, "this feature is coming soon ™");
    },

    // Display a random quote with a score above 5
    popular: function(options, source)
    {
        quote.random({'score': 5}, source);
    },

    // Display a random quote
    random: function(options, source)
    {
        var where = [];
        var defaults =
        {
            'search': false,
            'score': 0
        };

        options = extend(defaults, options);

        if(options.search)
        {
            // Excape the search phrase and convert "*" into mysql wildcards
            where.push('`quote` like ' + model.connection.escape(options.search.replace(/\*/g, '%')));
        }

        if(options.score)
        {
            where.push('`score` >= ' + model.connection.escape(options.score));
        }

        if(where.length)
        {
            where = 'where ' + where.join (' and ');
        }

        model.connection.query('Select * from `quotes` ' + where + 'order by rand() limit 0,1', function(error, response)
        {
            // Make sure there wasn't an error
            if(!error && response.length)
            {
                quote.output(response[0], source);
            }
            else
            {
                core.helper.reply('say', source.from, source.to, "no quote found");
            }
        });
    },
};

module.exports =
{
    load: function(_client, _core)
    {
        core = _core;
        model = core.model;
        core.helper.bind(quote.events, quote);
    },

    unload: function()
    {
        core.helper.unbind(quote.events, quote);
    }
}
