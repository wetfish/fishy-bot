// Buttbot functionality!
// I LOVE BUTTS

var url = require("url");

// secure random number generation is IMPORTANT
var crypto = require("crypto");

var butt =
{
    client: false,
    methods: ['message', 'action'],
    stuff: ['dick', 'butt', 'dong'],

    generate: function(message)
    {
        message = message.split(' ');
        var mutated = false;

        for(var i = 0, l = message.length; i < l; i++)
        {
            // Prevent repeating URLs
            if(url.parse(message[i]).slashes)
                message[i] = '';

            var random = new Buffer(crypto.randomBytes(1)).readUInt8(0);

            if(random < 44)
            {
                var plural = new Buffer(crypto.randomBytes(1)).readUInt8(0);
                var caps = new Buffer(crypto.randomBytes(1)).readUInt8(0);
                var choice = new Buffer(crypto.randomBytes(1)).readUInt8(0) % butt.stuff.length;
                choice = butt.stuff[choice];

                if(plural % 2)
                    choice += "s";

                if(caps % 4 == 1)
                    choice = choice.toUpperCase();

                // Check if the original message is surrounded by any special characters
                var surrounded = message[i].match(/^([^a-z]+)?(?:.*?)([^a-z]+)?$/i);

                // Make sure the entire string isn't special characters
                if(surrounded[0] == surrounded[1])
                    surrounded[1] = false;

                message[i] = (surrounded[1] || '') + choice + (surrounded[2] || '');
                mutated = true;
            }
            
            // keep looping forever, lol
            // TODO:  <lq> rachel: better to pick a randomly-sized subset of the words and mutate those
            if(i + 1 == l && !mutated)
                i = 0;
        }
        
        message = message.join(' ');
        return message;
    },

    message: function(from, to, message, details)
    {
        var chance = new Buffer(crypto.randomBytes(1)).readUInt8(0);
        
        if(chance > 254)
        {
            message = butt.generate(message);

            // If this is a channel message
            if(to.charAt(0) == '#')
            {
                butt.client.say(to, message);
                console.log("["+to+"] <fishy> "+message);
            }
            // This must be a private message ^_~
            else
            {
                butt.client.say(from, message);
                console.log("["+from+"] <fishy> "+message);
            }
        }
    },

    action: function(from, to, message, details)
    {
        var chance = new Buffer(crypto.randomBytes(1)).readUInt8(0);
        
        if(chance > 254)
        {
            message = butt.generate(message);

            if(to.charAt(0) == '#')
            {
                butt.client.action(to, message);
                console.log("["+to+"] * fishy "+message);
            }
            else
            {
                butt.client.action(from, message);
                console.log("["+from+"] * fishy "+message);
            }
        }
    },

    bind: function()
    {
        for(var i = 0, l = butt.methods.length; i < l; i++)
        {
            var method = butt.methods[i];
            butt.client.addListener(method, butt[method]);
        }
    },

    unbind: function()
    {
        for(var i = 0, l = butt.methods.length; i < l; i++)
        {
            var method = butt.methods[i];
            butt.client.removeListener(method, butt[method]);
        }
    }
};

module.exports =
{
    load: function(client)
    {
        butt.client = client;
        butt.bind();
    },

    unload: function()
    {
        butt.unbind();
        delete butt;
        delete url;
        delete crypto;
    }
}
