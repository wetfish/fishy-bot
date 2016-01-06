// General purpose messaging from external apps
var http = require('http');
var crypto = require('crypto');
var compare = require('buffer-equal-constant-time');

var webhook =
{
    core: false,
    client: false,
    server: false,
    port: 12345,
    channel: '#wetfish',

    init: function()
    {
        webhook.server = http.createServer(webhook.handler).listen(webhook.port);
    },

    handler: function(request, response)
    {
        console.log(request);
        response.end();
    },

    verify: function(hash, payload)
    {
        hash = hash.split('=');

        // Loop through webhook keys
        for(var i = 0, l = webhook.core.secrets.webhook_keys.length; i < l; i++)
        {
            var calculated = crypto.createHmac(hash[0], webhook.core.secrets.webhook_keys[i]).update(JSON.stringify(payload)).digest('hex')
            var matched = compare(new Buffer(hash[1]), new Buffer(calculated));

            if(matched)
            {
                return true;
            }
        }

        // If nothing matched, return false
        return false;
    }
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
        
        // Delete defined variables
        delete webhook;
    },
}
