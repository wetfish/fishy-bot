/* METRONOME
 */
var pg = require('pg');
var crc32 = require('crc-32');
var config = require('../config/secret.js');
var conString = "postgres://" + config.postgres.user + ":" + config.postgres.password + "@" + config.postgres.host + "/" + config.postgres.database;
var metronome = 
{
    client: false,
    methods: ['message', 'action'],
    wait: false,
    wait: false,
    hostWait: {},
    timeout: false,
    hostTimeout: {},

    message: function(from, to, message, details)
    {
        var from_pogeyman = '';
        var target_pogeyman = '';
        var move = '';
        if(message.charAt(0) == "!")
        {
            message = message.substr(1);
            message = message.split(' ');

            var command = message.shift();
            
            if(command == "metronome") 
            {
                var timeout = metronome.waiting(1, details.host, 1);

                if(timeout)
                {
                    metronome.reply('say', from, from, "Can't metronome, won't metronome. ("+timeout+" seconds remaining)");
                    return;
                }
                if (message.length >= 1) 
                {
                    var target = message.join();
                    target = target.replace(',', ' ');
                    target = target.trim();
                } 
                else 
                {
                    metronome.client.say(to, '...But, it failed! (metronome needs a target.)');
                    return;
                }
                var from_crc = crc32.str(from)>>>0;
                var target_crc = crc32.str(target)>>>0;
                var from_pogeydex = (from_crc % 721) + 1;
                //console.log(from_pogeydex);
                var target_pogeydex = (target_crc % 721) + 1;
                //console.log(target_pogeydex);
                var client = new pg.Client(conString);
                client.connect(function(err) 
                {
                    if(err) 
                    {
                        return console.error('could not connect to postgres', err);
                    }
                    client.query('SELECT name FROM pokemon_species_names psn INNER JOIN pokemon_species ps ON (psn.pokemon_species_id = ps.id) inner join (values ('+ from_pogeydex + ', 1), ('+ target_pogeydex +', 2)) as x (id, ordering) on (ps.id = x.id) WHERE psn.local_language_id = 9 AND ps.id IN ('+ from_pogeydex +', '+ target_pogeydex +') order by x.ordering', function(err, result) 
                    {
                        if(err) 
                        {
                            return console.error('error running query', err);
                        } else if(result.rows.length < 1) 
                        {
                            return console.error('no rows in query');
                        }
                         
                        from_pogeyman = result.rows[0].name;
                        target_pogeyman = result.rows[1].name;
                        client.query("SELECT mn.name FROM move_names mn INNER JOIN moves m ON (mn.move_id = m.id) WHERE m.identifier NOT IN('after-you','assist','bestow','chatter','copycat','counter','covet','destiny-bond','detect','endure','feint','focus-punch','follow-me','freeze-shock','helping-hand','ice-burn','me-first','mimic','mirror-coat','mirror-move','nature-powder','protect','quash','quick-guard','rage-powder','relic-song','secret-sword','sketch','sleep-talk','snarl','snatch','snore','struggle','switcheroo','techno-blast','thief','transform','trick','v-create','wide-guard') AND m.id < 10000 AND mn.local_language_id = 9 ORDER BY random() limit 1", function(err, result)
                        {
                            if(err)
                            {
                                return console.error('error running query', err);
                            } else if(result.rows.length < 1)                       
                            {
                                return console.error('no rows in query');
                            }
                            move = result.rows[0]['name'];
                            var output = from + " the " + from_pogeyman + " uses Metronome! " + from + " the " + from_pogeyman + " uses " + move + " against " + target + " the " + target_pogeyman + "!"
                            metronome.client.say(to, output);
                            console.log(output);
                            client.end();
                        });
                    });
                });
            }
        }
    },

    // This really should be a core function or something
    reply: function(type, from, to, message)
    {
        // If this is a channel message
        if(to.charAt(0) == '#')
        {
            metronome.client[type](to, message);
            console.log("["+to+"] <fishy> "+message);
        }
        else
        {
            metronome.client[type](from, message);
            console.log("["+from+"] <fishy> "+message);
        }
    },

    action: function(from, to, message, details)
    {
        // do nothing lol
    },

    waiting: function(timeout, host, extra)
    {
        // If there's a timeout for this user specifically
        if(metronome.hostWait[host])
        {
            var timeout = (metronome.hostTimeout[host].getTime() - new Date().getTime()) / 1000;
            return timeout;
        }

        // If there's a general timeout
        if(metronome.wait)
        {
            var timeout = (metronome.timeout.getTime() - new Date().getTime()) / 1000;
            return timeout;
        }

        if(typeof timeout == "undefined")
            timeout = 1;

        if(typeof extra == "undefined")
            extra = 0;

        // Set general timeouts
        var date = new Date();
        metronome.timeout = new Date(date.getTime() + (timeout * 60 * 1000));

        metronome.wait = setTimeout(function()
        {
            metronome.wait = false;
            metronome.timeout = false;
        }, timeout * 60 * 1000);

        // Set user-specific timeouts
        metronome.hostTimeout[host] = new Date(date.getTime() + (extra * 60 * 1000));

        metronome.hostWait[host] = setTimeout(function()
        {
            metronome.hostWait[host] = false;
            metronome.hostTimeout[host] = false;
        }, extra * 60 * 1000);
    },

    bind: function()
    {
        for(var i = 0, l = metronome.methods.length; i < l; i++)
        {
            var method = metronome.methods[i];
            metronome.client.addListener(method, metronome[method]);
        }
    },

    unbind: function()
    {
        for(var i = 0, l = metronome.methods.length; i < l; i++)
        {
            var method = metronome.methods[i];
            metronome.client.removeListener(method, metronome[method]);
        }
    }
};

module.exports =
{
    load: function(client)
    {
        metronome.client = client;
        metronome.bind();
    },

    unload: function()
    {
        metronome.unbind();
        delete metronome;
    }
}
