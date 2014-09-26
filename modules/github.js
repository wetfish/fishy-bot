var http = require('http');
var querystring = require('querystring');

function processPost(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            request.post = querystring.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

var github =
{
    server: false,
    port: 1234,

    init: function()
    {
        github.server = http.createServer(function(request, response)
        {
            if(request.method == 'POST')
            {
                processPost(request, response, function()
                {
                    console.log(request.post);
                    // Use request.post here

                    response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
                    response.end();
                });
            }
            else
            {
                response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
                response.end();
            }

        }).listen(github.port);
    }
};


module.exports =
{
    load: function()
    {
        github.init();
    },

    unload: function()
    {
        github.server.close();
        
        delete github;
        delete http;
        delete querystring;
        delete processPost;
    },
}
