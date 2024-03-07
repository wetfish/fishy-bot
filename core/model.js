var core;
var config = require('../config/secret.js');
var mysql = require('mysql');

var model =
{
    connection: false,
    connected: false,

    // Connect to mysql
    connect: function()
    {
        model.connection = mysql.createConnection(
        {
            host     : config.mysql.host,
            user     : config.mysql.user,
            password : config.mysql.password,
            database : config.mysql.database,
            timezone : 'utc',
            charset  : 'utf8mb4',
        });

        model.connected = true;
    },

    // Disconnect from mysql
    disconnect: function()
    {
        model.connection.end();
        model.connected = false;
    },

    // Function to generate select statements from objects
    where: function(select, glue)
    {
        if(typeof glue == "undefined")
            glue = " and ";

        var where = [];
        var values = [];

        for(var i = 0, keys = Object.keys(select), l = keys.length; i < l; i++)
        {
            where.push(model.mysql.escapeId(keys[i]) + ' = ?');
            values.push(select[keys[i]]);
        }

        return {where: where.join(glue), values: values};
    },

    error: function(error)
    {
        console.log('MySQL Error!', error);

        // Array of expected errors we should recover from
        var errors =
        [
            'PROTOCOL_CONNECTION_LOST',
            'ECONNREFUSED',
            'ECONNRESET',
        ];

        if(errors.indexOf(error.code) > -1)
        {
            console.log("Reconnecting...");
            model.disconnect();

            // Try reconnecting in a few seconds...
            setTimeout(function()
            {
                model.connect();
            }, 3000);
        }
    },
};

module.exports =
{
    load: function(_client, _core)
    {
        model.connect();
        model.connection.addListener('error', model.error);

        core = _core;
        core.model = model;
    },

    unload: function()
    {
        model.disconnect();
        model.connection.removeListener('error', model.error);

        delete core.model;
    }
};

