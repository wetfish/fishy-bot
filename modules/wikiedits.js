const BASE_URI = "https://wiki.wetfish.net";
const URI = BASE_URI + "/api/v1/recent";
const CHANNEL = "#botspam";

// Times are in minutes
const REANNOUNCE_TIME = 5;
const FETCH_TIME = 1;

const request = require('request');
// IRC Colors
const green = s => { return `\x0309${s}\x0F` };
const clear = s => { return `\x0F${s}\x0309` };

var wikiedits = 
{
    client: false,
    timeout: false,
    announceTimeout: null,
    lastAnnounceTime: null,

    seenIDs: [],

    names: [],
    pages: [],
    edits: [],
    // We're not ready at the start since every edit will be 'new'
    ready: false,

    fetch: function()
    {
        request(URI, {timeout: 5000}, (error, res, body) => 
        {
            if (error)
            {
                console.log(`[wikiedits] Error: ${error}`)
            }

            if (!error && res.statusCode == 200)
            {
                // Let's reverse it so we'll always grab the earliest new results first.
                wikiedits.act(JSON.parse(body).reverse());
            }
            wikiedits.timeout = setTimeout(wikiedits.fetch, FETCH_TIME * (60 * 1000));
        });
    },

    act: function(json)
    {
        if (json == null) return;
        for (var k in json)
        {
            var edit = json[k];
            if (!wikiedits.seenIDs.includes(edit.ID))
            {
                if (wikiedits.ready)
                {
                    // Found something new and we want to announce it.
                    if (!wikiedits.pages.inArray(edit.Title))
                    {
                        wikiedits.pages.push([edit.Title, edit.Path]);
                    }

                    if (!wikiedits.names.includes(edit.Name))
                    {
                        wikiedits.names.push(edit.Name);
                    }

                    wikiedits.edits.push(edit);
                    wikiedits.announce();
                }
                wikiedits.seenIDs.push(edit.ID);
            }
        }
        // We've at least seen the initial list, now we're ready for actual new edits
        wikiedits.ready = true;
    },

    announce: function()
    {
        var currentTime = new Date().getTime();
        // Announce if it's been more than REANNOUNCE_TIME minutes..
        if ((currentTime - wikiedits.lastAnnounceTime) >= REANNOUNCE_TIME * (60 * 1000))
        {
            var page = '';
            var names = '';
            var edits = '';

            if (wikiedits.names.length >= 4)
            {
                names = `${wikiedits.names.slice(0, 3).join(clear(', '))} ${clear('and')} ${green(wikiedits.names.length - 3)} others`;
            }
            else
            {
                names = wikiedits.names.join(clear(', '));
            }

            if (wikiedits.pages.length == 1)
            {
                page = `the ${green(wikiedits.pages[0][0])} page - ${BASE_URI}/${wikiedits.pages[0][1]}`;
            }
            else
            {
                page =  `${green(wikiedits.pages.length.toString())} pages - ${BASE_URI}/?recent`;
            }

            if (wikiedits.edits.length == 1)
            {
                edits = `made an edit to ${page} `;
            }
            else
            {
                edits = `made ${green(wikiedits.edits.length)} edits to ${page}`;
            }

            wikiedits.client.say(CHANNEL, `${green("[wiki]")} ${green(names)} ${edits}`);

            wikiedits.names = [];
            wikiedits.pages = [];
            wikiedits.edits = [];
            wikiedits.lastAnnounceTime = new Date().getTime();
        }
        else
        {  
            // Try again in REANNOUNCE_TIME minutes.
            if (!wikiedits.announceTimeout)
            {
                wikiedits.announceTimeout = setTimeout(() =>
                {
                    wikiedits.announce();
                    clearTimeout(wikiedits.announceTimeout);
                    wikiedits.announceTimeout = null;

                }, REANNOUNCE_TIME * (60 * 1000));
            }
        }
    },

    bind: function()
    {
        setImmediate(wikiedits.fetch);
    },

    unbind: function()
    {
        if(wikiedits.setTimeout)
        {
            clearTimeout(wikiedits.timeout);
        }

        if (wikiedits.announceTimeout)
        {
            clearTimeout(wikiedits.announceTimeout);
        }
    }
}

// Custom method to find whether a value is found within any array within the array.
Array.prototype.inArray = function(needle)
{
    for (var i in this)
    {
        for (var x in this[i])
        {
            if (this[i][x] == needle)
            {
                return true;
            }
        }
    }
    return false;
}

module.exports =
{
    load: function(client)
    {
        wikiedits.client = client;
        wikiedits.bind();
    },

    unload: function()
    {
        wikiedits.unbind();
        delete wikiedits;
    }
}