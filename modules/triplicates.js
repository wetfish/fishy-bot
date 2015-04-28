var triplicates = {
    methods: ['message'],
    client: false,
    db: {},
    config: {
        kick: true,
        ban: true,
        ban_notifications: true,
        ban_min_time: 15,
        ban_max_time: 3600,
        ban_reset_time: 5400,
        triplicate_reset_time: 30,
        max_repetitions: 3,
        channels: ['#wetfish'],
        ignore_names: ['Fiolina', 'fishy', 'Kitten', 'Neuromancer', 'denice'],
        ignore_hosts: []
    },
    
    message: function (from, to, message, details) {
        var uname = details.user + '@' + details.host;
        if (triplicates.config.ignore_names.indexOf(from) > -1 || 
            triplicates.config.ignore_hosts.indexOf(details.host) > -1) return;

        // If there is a list of channels, make sure we're in it!
        if(triplicates.config.channels.length && triplicates.config.channels.indexOf(to) == -1) return;
        
        message = message.trim();
        var user = triplicates.db[uname];
        if (user == undefined) {
            user = {
                name: from,
                channel: to,
                repetitions: 1,
                last_message: message,
                times_banned: 0,
                times_kicked: 0,
                ban_timeout: null,
                triplicate_timeout: null
            };
            triplicates.db[uname] = user;
            return;
        }
        
        if (user.last_message == message) {
            user.repetitions++;
            if (user.triplicate_timeout != null) {
                clearTimeout(user.triplicate_timeout);
            }
            user.triplicate_timeout = setTimeout(function () {
                user.last_message = '';
                user.repetitions = 1;
            }, triplicates.config.triplicate_reset_time * 1000);
        } else {
            user.repetitions = 1;
        }
        
        user.last_message = message;

        if (user.repetitions >= triplicates.config.max_repetitions) {
            // Oh, yay, we get to do something!
            if (triplicates.config.ban) {
                // Banning, w00t!
                user.times_banned++;

                var ban_time = triplicates.config.ban_min_time * user.times_banned;
                if (ban_time > triplicates.config.ban_max_time) {
                    ban_time = triplicates.config.ban_max_time;
                }

                // BANHAMMER
                triplicates.client.send('MODE', to, '+b', '*!' + uname);
                setTimeout(function () {
                    triplicates.client.send('MODE', to, '-b', '*!' + uname);
                }, ban_time * 1000);

                // Do we notify the user?
                if (triplicates.config.ban_notifications) {
                    triplicates.client.say(from, 'You have been banned from ' + to + ' for ' + ban_time + ' seconds for violating the triplicates rule, you have been banned ' + 
                        user.times_banned + ' time(s) due to triplicates in the last hour and a half. Your triplicates ban counter will reset to 0 in 1.5 hours if you do not violate the rule again.');
                }

                // Setup ban resets
                if (user.ban_timeout != null) {
                    clearTimeout(user.ban_timeout);
                }

                user.ban_timeout = setTimeout(function () {
                    user.times_banned = 0;
                    user.ban_timeout = null;
                }, triplicates.config.ban_reset_time * 1000);
            }
            
            if (triplicates.config.kick) {
                triplicates.client.send('KICK', to, details.nick, 'You\'ve been kicked for violating the triplicates rule! :D');
            }

            user.last_message = '';
            user.repetitions = 1;
        }
        triplicates.db[uname] = user;
	},
    
	bind: function()
	{
        for (var i = 0, l = triplicates.methods.length; i < l; i++) {
            var method = triplicates.methods[i];
            triplicates.client.addListener(method, triplicates[method]);
        }
    },

	unbind: function()
	{
        for (var i = 0, l = triplicates.methods.length; i < l; i++) {
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
