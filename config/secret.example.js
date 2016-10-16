// Rename this file to "secret.js" before running the fishy bot

module.exports =
{
    // Array of shared secrets used by modules/github.js and modules/webhook.js
    // Use one of these values as the "secret" when adding a webhook to GitHub
    // Different keys should be given to each user who wants to track their commits
    webhook_keys:
    [   
        'example',
        'change_me',
    ],

    // The password used to log into network services, used by modules/auth.js
    // On FishNet, this is the login token provided by NickServ after authenticating
    nickservPass: 'changeme',

    // MySQL configuration used by modules/quote.js and modules/greeting.js
    mysql:
    {
        host: 'localhost',
        user: 'fishy',
        password: 'changeme',
        database: 'fishy'
    },

    // Postgres configuration used by modules/metronome.js
    postgres:
    {
        host: 'localhost',
        user: 'fishy',
        password: 'changeme',
        database: 'fishy'
    }
};


