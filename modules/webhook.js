// General purpose messaging from external apps
var http = require('http');
var crypto = require('crypto');
var compare = require('buffer-equal-constant-time');
var url = require('url');

var webhook =
{
    core: false,
    client: false,
    server: false,
    port: 12345,
    commands: ['message', 'action'],

    // Initialize the webserver
    init: function()
    {
        webhook.server = http.createServer(webhook.handler).listen(webhook.port);
    },

    // Function to handle incoming web requests
    handler: function(request, response)
    {
        var parsed = url.parse(request.url, true)
        var data = parsed.query;
        var verified = webhook.verify(data.hash, data.payload);

        if(verified)
        {
            // Check if the payload contains JSON
            try
            {
                var payload = JSON.parse(data.payload);
            }
            catch(error)
            {
                var payload = {};
            }

            // If the payload contains a valid command
            if(webhook.commands.indexOf(payload.command) > -1)
            {
                webhook[payload.command](payload.data);
            }
        }
        else
        {
            console.log("!! Unverified data !!", data);
        }
        
        response.end();
    },

    // Function to verify requests against a list of pre-shared secrets
    verify: function(hash, payload)
    {
        if(!hash) return false;
        hash = hash.split('=');

        // Loop through webhook keys
        for(var i = 0, l = webhook.core.secrets.webhook_keys.length; i < l; i++)
        {
            try
            {
                var calculated = crypto.createHmac(hash[0], webhook.core.secrets.webhook_keys[i]).update(payload).digest('hex')
                var matched = compare(new Buffer(hash[1]), new Buffer(calculated));
            }
            catch(error)
            {
                console.log("There was an error creating the HMAC!");
                console.log(error);
            }
            
            if(matched)
            {
                return true;
            }
        }

        // If nothing matched, return false
        return false;
    },

    // Function to send a message to a channel or user
    message: function(data)
    {
        console.log(data);
    },

    // Function to send an action to a channel or user
    action: function(data)
    {
        console.log(data);
    },
};


module.exports =
{
    load: function(client, core)
    {
        webhook.client = client;
        webhook.core = core;
        webhook.init();
    },

    unload: function()
    {
        webhook.server.close();

        // Prevent new connections while unloading
        webhook.server.on('request', function( req, resp ) { req.socket.end(); });
        webhook.server.once('close', function()
        {
            // Remove the listeners after the server has shutdown for real.
            webhook.server.removeAllListeners();
        });
        
        // Delete node modules
        delete http;
        delete crypto;
        delete compare;
        delete url;

        // Delete defined variables
        delete webhook;
    },
}
