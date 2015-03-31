var triplicates =
 {
    MAX_REPS: 3,
    client: false,
    methods: ['message'],
    storage: {},
    kick_mode: {
        kick: true,
        ban: false,
        ban_timeout: 10 // Timeout in seconds
    },
    
    message: function (from, to, message, details) {
        var currentTime = new Date().getTime();
        var userMessage = {
            name: from,
            to: to,
            text: message.trim(),
            timestamp: currentTime
        };
        
        var previousMessages = [];
        
        if (details.host in triplicates.storage) {
            previousMessages = triplicates.storage[details.host];
        } else {
            triplicates.storage[details.host] = previousMessages;
        }
                
        var kickUser = false;
        var i = previousMessages.length;
        while (i--) {
            var currentMessage = previousMessages[i];
            // Do a check to see if this message older than 10 seconds, if so discard it
            if ((currentTime - currentMessage.timestamp) / 1000 > 10) {
                previousMessages.splice(i, 1);
                continue;
            }
        }
        
        var messages = previousMessages.filter(function (m) {
            return m.text == userMessage.text;
        });
        
        if (messages.length == 0) {
            previousMessages = [];
        }

        if (messages.length >= triplicates.MAX_REPS - 1) {
            if (triplicates.kick_mode.kick) {
                triplicates.client.send('KICK', to, details.nick, 'You\'ve been kicked for violating the triplicates rule! :D');
            }
            if (triplicates.kick_mode.ban) {
                triplicates.client.send('MODE', to, '+b', details.prefix);
                setTimeout(function () {
                    triplicates.client.send('MODE', to, '-b', details.prefix);
                }, triplicates.kick_mode.ban_timeout * 1000);
            }
            triplicates.storage[details.host] = [];
        } else {
            triplicates.storage[details.host] = previousMessages;
        }

        previousMessages.push(userMessage);
	},

	bind: function()
	{
		for(var i = 0, l = triplicates.methods.length; i < l; i++)
		{
			var method = triplicates.methods[i];
			triplicates.client.addListener(method, triplicates[method]);
		}
	},

	unbind: function()
	{
		for(var i = 0, l = triplicates.methods.length; i < l; i++)
		{
			var method = triplicates.methods[i];
			triplicates.client.removeListener(method, triplicates[method]);
		}
	}
};

module.exports =
{
	load: function(client)
	{
		triplicates.client = client;
		triplicates.bind();
	},

	unload: function()
	{
		triplicates.unbind();
		delete triplicates;
	}
}
