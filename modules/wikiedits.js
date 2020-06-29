const URI = "https://wiki.wetfish.net/api/v1/recent";

// Times are in minutes
const REANNOUNCE_TIME = 5;
const FETCH_TIME = 1;

const request = require('request');

var wikiedits = 
{
    client: false,
    timeout: false,
    announceTimeout: null,
    lastAnnounceTime: null,

    seenIDs: [],
    announceList: [],

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
                    wikiedits.announceList.push(edit);
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
            if (wikiedits.announceList.length > 1)
            {
                wikiedits.client.say('#botspam', `\x0309[wiki]\x0F There has been \x0309${wikiedits.announceList.length}\x0F edits in the last ${REANNOUNCE_TIME} minutes! Have a look: https://wiki.wetfish.net/?recent`);
                console.log(wikiedits.announceList.length);
            }
            else if (wikiedits.announceList.length == 1)
            {
                wikiedits.client.say('#botspam', `\x0309[wiki]\x0F \x0309${wikiedits.announceList[0].Name}\x0F edited \x0309${wikiedits.announceList[0].Title}\x0F at https://wiki.wetfish.net/?recent`);
            }
            wikiedits.announceList = [];
            wikiedits.lastAnnounceTime = new Date().getTime();
        }
        else
        {  
            // Try again in REANNOUNCE_TIME minutes.
            if (!wikiedits.announceTimeout)
            {
                wikiedits.announceTimeout = setTimeout(wikiedits.announce, REANNOUNCE_TIME * (60 * 1000));
            }
        }
    },

    bind: function()
    {
        setImmediate(wikiedits.fetch);
    },

    unbind: function()
    {
        if(wikiedits.timeout !== null)
        {
            clearTimeout(wikiedits.timeout);
        }
    }
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