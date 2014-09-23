var output =
{
    client: false,

    message: function(user, channel, message, details)
    {
        console.log("["+channel+"]  <"+user+"> "+message);
    },

    bind: function()
    {
        output.client.addListener("message", output.message);
    },

    unbind: function()
    {
        output.client.removeListener("message", output.message);
    }
};

module.exports =
{
    load: function(client)
    {
        output.client = client;
        output.bind();
    },

    unload: function()
    {
        output.unbind();
        delete output;
    }
};
