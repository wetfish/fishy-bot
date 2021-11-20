/*
 * Save and display quotes from the channel
 */

var core;
var model;
var extend = require('extend');
var crypto = require('crypto');

function randomInteger(min, max)
{
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

var quote =
{
    events: ['message'],
    functions: ['add', 'blame', 'latest', 'delete', 'like', 'dislike', 'meh', 'popular'],
    search: {}, // This object stores the random seed and current index of results being displayed

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
                var remaining = parsed.chunks.join(' ');

                if(quote.functions.indexOf(option) > -1)
                {
                    // Pass the remaining message data to the matched quote function
                    quote[option](remaining, source);
                }

                // Check if the user is searching for a specific quote ID
                else if(option && option.match(/^#?[0-9]+$/))
                {
                    quote.get(option, source);
                }

                // Otherwise, this must be a quote search
                else
                {
                    quote.random({'search': parsed.message}, source);
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

        var score = '';

        if(data.score != 0)
        {
            if(data.score > 0)
            {
                // Green text for good quotes
                score = "[3Score: " + data.score + "] ";
            }
            else
            {
                // Red tet for bad quotes
                score = "[4Score: " + data.score + "] ";
            }
        }

        core.helper.reply('say', source.from, source.to, "[#" + data.id + "] [" + date + "] " + score + data.quote);
    },

    // Add a quote to the database
    add: function(quote, source)
    {
        quote = quote.trim();

        if(quote)
        {
            model.connection.query('Insert into `quotes` (quote, created_by) values(?, ?)', [quote, source.from], function(error, result)
            {
                if(error)
                {
                    core.helper.reply('say', source.from, source.to, "there was an error adding your quote!");
                    return;
                }

                core.helper.reply('say', source.from, source.to, "quote #" + result.insertId + " added!");
            });
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

        model.connection.query('Select * from `quotes` where `id` = ? and `deleted_at` is null', id, function(error, response)
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
        model.connection.query('Select `created_by` from `quotes` where `id` = ? and `deleted_at` is null', id, function(error, response)
        {
            // Make sure there wasn't an error
            if(!error && response.length)
            {
                if(response[0].created_by)
                {
                    core.helper.reply('say', source.from, source.to, "you can blame " + response[0].created_by + " for that one");
                }
                else
                {
                    core.helper.reply('say', source.from, source.to, "not sure who to blame for that one");
                }
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
        model.connection.query('Select * from `quotes` where `deleted_at` is null order by `id` desc limit 0,1', function(error, response)
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
        if(core.isAdmin(source.details))
        {
            // Remove any non-numeric characters
            id = parseInt(id.replace(/[^0-9]/g, ''));

            if(isNaN(id))
            {
                core.helper.reply('say', source.from, source.to, "you must specify the ID of the quote to be deleted");
                return;
            }

            model.connection.query('Update `quotes` set `deleted_at` = now(), `updated_at` = now() where `id` = ?', id);
            core.helper.reply('say', source.from, source.to, "quote deleted!");
        }
        else
        {
            core.helper.reply('say', source.from, source.to, "only admins can delete quotes, use !quote dislike instead");
        }
    },

    vote: function(id, source, score)
    {
        // Save this user's vote
        model.connection.query("Insert into `votes` (quote_id, voter, vote) values (?, ?, ?) on duplicate key update `vote` = ?, `updated_at` = now()", [id, source.from, score, score], function(error, response)
        {
            if(error)
            {
                return;
            }

            // Get thet total number of votes for this quote
            model.connection.query("Select sum(vote) as score from `votes` where `quote_id` = ?", [id], function(error, response)
            {
                // Save a cache of the total in the quotes table
                if(error)
                {
                    return;
                }

                model.connection.query("Update `quotes` set `score` = ?, `updated_at` = now() where `id` = ?", [response[0].score, id]);
            });
        });
    },

    // Increase the score of a quote
    like: function(id, source)
    {
        core.helper.isRegistered(source.from, function(registered)
        {
            if(registered)
            {
                model.connection.query('Select * from `quotes` where `id` = ? and `deleted_at` is null', id, function(error, response)
                {
                    if(error || !response.length)
                    {
                        core.helper.reply('say', source.from, source.to, "that's not a quote!");
                    }
                    else
                    {
                        quote.vote(id, source, 1);
                        core.helper.reply('say', source.from, source.to, "that's a good quote!");
                    }
                });
            }
            else
            {
                core.helper.reply('say', source.from, source.to, "you must be registered to use this command");
            }
        });
    },

    // Reduce the score of a quote
    dislike: function(id, source)
    {
        core.helper.isRegistered(source.from, function(registered)
        {
            if(registered)
            {
                model.connection.query('Select * from `quotes` where `id` = ? and `deleted_at` is null', id, function(error, response)
                {
                    if(error || !response.length)
                    {
                        core.helper.reply('say', source.from, source.to, "that's not a quote!");
                    }
                    else
                    {
                        quote.vote(id, source, -1);
                        core.helper.reply('say', source.from, source.to, "that quote SUCKS!");
                    }
                });
            }
            else
            {
                core.helper.reply('say', source.from, source.to, "you must be registered to use this command");
            }
        });
    },

    // Reset your vote back to 0
    meh: function(id, source)
    {
        core.helper.isRegistered(source.from, function(registered)
        {
            if(registered)
            {
                quote.vote(id, source, 0);
                core.helper.reply('say', source.from, source.to, "meh, whatever");
            }
            else
            {
                core.helper.reply('say', source.from, source.to, "you must be registered to use this command");
            }
        });
    },

    // Display a random quote with a score above a specific threshold
    popular: function(options, source)
    {
        quote.random({'score': 2}, source);
    },

    // Display a random quote
    random: function(options, source)
    {
        var where = ['`deleted_at` is null'];
        var defaults =
        {
            'search': false,
            'score': 0
        };

        options = extend(defaults, options);

        if(options.search)
        {
            options.search = options.search.trim();

            // Add wildcards to the search if none were provided
            if(options.search.indexOf('*') == -1)
            {
                options.search = '*' + options.search + '*';
            }

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

        model.connection.query('Select count(`id`) as count from `quotes` ' + where, function(countError, countResponse)
        {
            // Make sure there wasn't an error
            if(!countError && countResponse.length)
            {
                var count = countResponse[0]['count'];

                // Hash the where string
                var hash = crypto.createHash('sha256');
                hash.update(where);
                var whereHash = hash.digest('hex');

                if(quote.search[whereHash] === undefined)
                {
                    // Initialize with a random seed to prevent duplicate quotes from being displayed when this module is reloaded
                    quote.search[whereHash] = {seed: randomInteger(1, 1000000), index: 0, total: count};
                }

                // If the cached total is different from the current count of results, reset the search index
                if(quote.search[whereHash].total != count)
                {
                    quote.search[whereHash] = {seed: randomInteger(1, 1000000), index: 0, total: count};
                }

                // If the index is greater than the number of results, increment the seed
                if(quote.search[whereHash].index >= count)
                {
                    quote.search[whereHash].seed++;
                    quote.search[whereHash].index = 0;
                }

                model.connection.query('Select * from `quotes` ' + where + ' order by rand(' + quote.search[whereHash].seed + ') limit ' + quote.search[whereHash].index + ',1', function(error, response)
                {
                    if(!error && response.length)
                    {
                        quote.output(response[0], source);
                    }
                });

                quote.search[whereHash].index++;
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
