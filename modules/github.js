var fs = require('fs');
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

        request.on('end', function()
        {
            try
            {
                // Check if the server responded with JSON
                request.post = JSON.parse(queryData);
            }
            catch(error)
            {
                // Otherwise, process the post request normally
                request.post = querystring.parse(queryData);
            }
            
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

var github =
{
    client: false,
    server: false,
    port: 1234,
    channel: 'rachel',
    events: ['gollum', 'push'],

    groups:
    [
        {text: 'couple', 'min': 2, 'max': 2},
        {text: 'few', 'min': 3, 'max': 4},
        {text: 'bunch of', 'min': 5, 'max': 7},
        {text: 'lot of', 'min': 8, 'max': 12},
        {text: 'ton of', 'min': 13, 'max': 0x20000000000000},
    ],

    find_group: function(value)
    {
        github.groups.forEach(function(group)
        {
            if(value >= group.min && value <= group.max)
                return group.text;
        });
    },

    sort: function(object)
    {
        var sortable = [];
        
        for(var key in object)
        {
            sortable.push([key, object[key]])
        }
        
        sortable.sort(function(a, b) {return a[1] - b[1]});

        return sortable;
    },

    init: function()
    {
        github.server = http.createServer(function(request, response)
        {
            if(request.method == 'POST')
            {
                processPost(request, response, function()
                {
                    console.log("_!_ Post request recieved");

                    // Calculate SHA hash to verify request

                    // Send event to its handler if defined in github.events
                    if(github.events.indexOf(request.headers['x-github-event']) > -1)
                    {
                        github[request.headers['x-github-event']](request.post);
                    }
                    
                    // Write to a logfile
                    fs.appendFile('logs/github.txt', JSON.stringify(request.headers) + "\n" + JSON.stringify(request.post) + "\n\n", function (error)
                    {
                        if(error)
                        {
                            console.log("_Error_ Unable to append file!");
                            console.log(error);
                        }
                    });
                    
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
    },

    gollum: function(data)
    {
        var user = data.sender.login;
        var name = data.repository.name;
        var page = data.repository.html_url;
        var action = data.pages[0].action;
        var actions = [];

        if(data.pages.length == 1)
        {
            page = data.pages[0].html_url;
            
            var message = "[Github] User "+user+" "+action+" a page on the "+name+" wiki. ( "+page+" )";
            github.client.say(github.channel, message);
            console.log(message);
        }

/*
        if(data.pages.length < 8)
        {
            data.pages.forEach(function(page)
            {
                if(typeof actions[page.action] == "undefined")
                    actions[page.action] = 0;

                actions[page.action]++;
            });

            
        }
        else
        {

        }
*/
    },

    push: function(data)
    {
        var name = data.repository.name;
        var page = data.repository.html_url;
        var message;
        
        var author = data.commits[0].author.username;
        var authors = {};

        if(data.commits.length == 1)
        {
            page = data.commits[0].url;
            message = "[Github] A commit was made by "+author+" in the "+name+" project. ( "+page+" )";
        }
        else
        {
            data.commits.forEach(function(commit)
            {
                if(typeof authors[commit.author.username] == "undefined")
                    authors[commit.author.username] = 0;

                authors[commit.author.username]++;
            });

            authors = Object.keys(authors);

            if(authors.length > 1)
            {
                var last = authors.pop();
                author = authors.join(', ');
                author += " & " + last;
            }
            else
            {
                author = authors[0];
            }

            var group = github.find_group(data.commits.length);
            message = "[Github] A "+group+" commits were made by "+author+" in the "+name+" project. ( "+page+" )";
        }
    
        github.client.say(github.channel, message);
        console.log(message);
    }
};


module.exports =
{
    load: function(client)
    {
        github.client = client;
        github.init();
    },

    unload: function()
    {
        github.server.close();
        
        github.server.on('request', function( req, resp ) { req.socket.end(); });
        github.server.once('close', function()
        {
            // Remove the listeners after the server has shutdown for real.
            github.server.removeAllListeners();
        });
        
        delete github;
        delete http;
        delete querystring;
        delete processPost;
    },
}
