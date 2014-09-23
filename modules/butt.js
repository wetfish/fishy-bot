// Buttbot functionality!
// I LOVE butt

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
            var random = new Buffer(crypto.randomBytes(1)).readUInt8(0);

            if(random <= 44)
            {
                var plural = new Buffer(crypto.randomBytes(1)).readUInt8(0);
                var choice = new Buffer(crypto.randomBytes(1)).readUInt8(0) % butt.stuff.length;
                choice = butt.stuff[choice];

                if(plural % 2)
                    choice += "s";

                message[i] = choice;
                mutated = true;
            }
            
            // keep looping forever, lol
            if(i + 1 == l && !mutated)
                i = 0;
        }
        
        message = message.join(' ');
        return message;
    }

    message: function(from, to, message, details)
    {
        var chance = new Buffer(crypto.randomBytes(1)).readUInt8(0);
        
        if(message.match(/fishy/) || chance >= 244)
        {
            message = butt.generate(message);
            butt.client.say(to, message);
            console.log("["+to+"] <fishy> "+message);
        }
    },

    action: function(from, to, message, details)
    {
        var chance = new Buffer(crypto.randomBytes(1)).readUInt8(0);
        
        if(message.match(/fishy/) || chance >= 244)
        {
            message = butt.generate(message);
            butt.client.action(to, message);
            console.log("["+to+"] * "+from+" "+message);
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
        delete crypto;
    }
}
