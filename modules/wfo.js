// rss and rss2 don't show the author, thus using type=atom.
const URI = 'https://wetfishonline.com/forum/index.php?action=.xml;sa=recent;limit=10;type=atom';

const util = require('util');
var FeedParser = require('feedparser');
var request = require('request');

////////////////////////////////////////////////////////////////////////////////
function MessageCounter(window_length) {
    this.window_length = window_length;
    this.message_times = [];
}
// Introduce a message and also return the number of messages in the
// window period.
MessageCounter.prototype.boop = function () {
    var curtime = Date.now();
    this.message_times.push(curtime);
    var thismessagecounter = this;
    this.message_times = this.message_times.filter(function (x) {
        return x >= curtime - thismessagecounter.window_length;
    });
    return this.message_times.length;
};
MessageCounter.prototype.reset = function () {
    this.message_times = [];
}

////////////////////////////////////////////////////////////////////////////////
function State() {
    this.STATE_NOTREADY = 0; // Before we have seen_guids, so we don't know what msgs are new.
    this.STATE_NORMAL = 1;   // We're active.
    this.STATE_BACKOFF = 2;  // We're chilling out for a bit because we just came.

    // If we try to send more than TRIGGER_NUM_MESSAGES in
    // TRIGGER_INTERVAL unit of time, let's chill out for
    // BACKOFF_TIMEOUT seconds until checking again.
    //
    // If you don't want to miss messages silently because they
    // overflow the feed, you should set it up so that
    // TRIGGER_NUM_MESSAGES is less than the number of items the feed
    // returns.
    this.TRIGGER_NUM_MESSAGES = 5;
    this.TRIGGER_INTERVAL = 10 * (60 * 1000 /*minutes*/);
    this.NORMAL_TIMEOUT = 2 * (60 * 1000);
    this.BACKOFF_TIMEOUT = 30 * (60 * 1000);

    this.seen_guids = []; // TODO: Clean up old items.
    this.current_state = this.STATE_NOTREADY;
    this.msgcounter = new MessageCounter(this.TRIGGER_INTERVAL);
}
State.prototype.getCurrentTimeout = function() {
    if (this.current_state == this.STATE_NOTREADY) {
        return 0;
    } else if (this.current_state == this.STATE_NORMAL) {
        return this.NORMAL_TIMEOUT;
    } else if (this.current_state == this.STATE_BACKOFF) {
        return this.BACKOFF_TIMEOUT;
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

        for (var i in need_announce) {
            var item = need_announce[i];
            announce_fn(util.format("9[WFO] %s 9posted %s 9at %s",
                                    item.author,
                                    item.title,
                                    item.guid));

            if (this.msgcounter.boop() > this.TRIGGER_NUM_MESSAGES) {
                announce_fn("9[WFO] 4Too much shit's going on. I'll chill the fuck out for a bit. Join the action at 9https://wetfishonline.com/ 4!");

                console.log('WFO entering STATE_BACKOFF');
                this.current_state = this.STATE_BACKOFF;
                this.seen_guids = [];
                this.msgcounter.reset();
                return;
            }
        }
    }

    // We populated seen_guilds, so now we're ready.
    if (this.current_state == this.STATE_NOTREADY) {
        console.log('WFO entering STATE_NORMAL');
        this.current_state = this.STATE_NORMAL;
    }

    // We just got the item list after backoff. We're ready now!
    if (this.current_state == this.STATE_BACKOFF) {
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
            console.log('feedparser error');
            console.log(error);
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
            wfo.state.newItems(wfo.buffer,
                                  function (line) {
                                      wfo.client.say('#wetfish', line);
                                  });
            wfo.timeout = setTimeout(wfo.tick, wfo.state.getCurrentTimeout());
        });

        var req = request(URI, {timeout: 5000});
        req.on('error', function (error) {
            console.log(error);
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
