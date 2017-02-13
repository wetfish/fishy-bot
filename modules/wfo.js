// rss and rss2 don't show the author, thus using type=atom.
const URI = 'https://wetfishonline.com/forum/index.php?action=.xml;sa=recent;limit=10;type=atom';

const util = require('util');
var FeedParser = require('feedparser');
var request = require('request');

////////////////////////////////////////////////////////////////////////////////
function State() {
    this.STATE_NOTREADY = 0; // Before we have seen_guids, so we don't know what msgs are new.
    this.STATE_NORMAL = 1;   // We're active.

    this.TIMEOUT = 5 * (60 * 1000);
    this.LIMIT = 2; // Max num items we would write about each time?

    this.seen_guids = []; // TODO: Clean up old items.
    this.current_state = this.STATE_NOTREADY;
}
State.prototype.getCurrentTimeout = function() {
    if (this.current_state == this.STATE_NOTREADY) {
        return 10000; // This is used when there's an error before we're ready.
    } else if (this.current_state == this.STATE_NORMAL) {
        return this.TIMEOUT;
    }
    console.log('getCurrentTimeout error');
}
State.prototype.newItems = function(items, announce_fn) {

    var need_announce = [];

    // my nodejs isn't ES6 yet so i can't use the fat arrow function
    // defn.
    var thisstate = this;

    items.forEach(function (item) {
        if (thisstate.seen_guids.indexOf(item.guid) == -1) {
            need_announce.push(item);
            thisstate.seen_guids.push(item.guid);
        }
    });

    if (this.current_state == this.STATE_NORMAL) {
        // feed gives newest entries first, but we should
        // announce oldest first.
        need_announce.reverse();

        if (need_announce.length >= this.LIMIT) {

            announce_fn(util.format("9[WFO] At least 9%d posts were made in the last %d minutes! Join the action at 9https://wetfishonline.com/",
                                    need_announce.length,
                                    this.TIMEOUT / 60 / 1000));

        } else if (need_announce.length > 0) {
            for (var i in need_announce) {
                var item = need_announce[i];
                announce_fn(util.format("9[WFO] %s 9posted %s 9at %s",
                                        item.author,
                                        item.title,
                                        item.guid));
            }
        }
    }

    // We populated seen_guids, so now we're ready.
    if (this.current_state == this.STATE_NOTREADY) {
        console.log('WFO entering STATE_NORMAL');
        this.current_state = this.STATE_NORMAL;
    }
}

////////////////////////////////////////////////////////////////////////////////
var wfo =
{
    state: new State(),
    client: false,
    stop: false,
    timeout: null,

    buffer: null,

    tick: function()
    {
        wfo.timeout = null;
        wfo.buffer = [];

        var feedparser = new FeedParser();
        feedparser.on('error', function (error) {
            console.log(new Date(), 'WFO feedparser error.', error);
        });
        feedparser.on('readable', function (error) {
            var stream = this;
            var meta = this.meta;
            var item;

            while (item = stream.read()) {
                wfo.buffer.push(item);
            }
        });
        feedparser.on('finish', function () {
            var stream = this;

            // We get here even when there's an error.
            if (wfo.buffer.length > 0) {
                wfo.state.newItems(wfo.buffer,
                                   function (line) {
                                       wfo.client.say('#botspam', line);
                                   });
            }
            wfo.timeout = setTimeout(wfo.tick, wfo.state.getCurrentTimeout());
        });

        var req = request(URI, {timeout: 5000});
        req.on('error', function (error) {
            var stream = this;

            console.log(new Date(), 'WFO request error.', error);

            if (!stream.cancel_for_error) {
                console.log(new Date(), 'WFO Going to wait for the next tick.');
                wfo.timeout = setTimeout(wfo.tick, wfo.state.getCurrentTimeout());
            }

            // If we get an error it may not be the only one.
            stream.cancel_for_error = true;
        });
        req.on('response', function (res) {
            // If we're asked to stop and we got the http response
            // right now, let's not send it.
            if (wfo.stop) {
                return;
            }

            var stream = this;
            if (res.statusCode !== 200) {
                console.log('Error');
            } else {
                stream.pipe(feedparser);
            }
        });
    },

    bind: function()
    {
        setImmediate(wfo.tick);
    },

    unbind: function()
    {
        wfo.stop = true;
        if (wfo.timeout !== null) {
            clearTimeout(wfo.timeout);
        }
    }
};

module.exports =
{
    load: function(client)
    {
        wfo.client = client;
        wfo.bind();
    },

    unload: function()
    {
        wfo.unbind();
        delete wfo;

        // TODO Delete node imports
    }
}
