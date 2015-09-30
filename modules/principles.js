// secure random number generation is IMPORTANT
var crypto = require("crypto");
var client, core;

// A command to output the principles of Burning Man
// Usage:
//      !p2 - Displays principle 2
//      !principle 4 - Displays principle 4
//      !principle 420 - Displays a random catchphrase

var burn =
{
    events: ['message'],

    principles:
    [
        {title: 'Radical Inclusion', text: "Anyone may be a part of Wetfish. We welcome and respect the stranger. No prerequisites exist for participation in our community."},
        {title: 'Gifting', text: "Wetfish is devoted to acts of gift giving. The value of a gift is unconditional. Gifting does not contemplate a return or an exchange for something of equal value."},
        {title: 'Decommodification', text: "In order to preserve the spirit of gifting, our community seeks to create social environments that are unmediated by commercial sponsorships, transactions, or advertising. We stand ready to protect our culture from such exploitation. We resist the substitution of consumption for participatory experience."},
        {title: 'Radical Self-reliance', text: "Wetfish encourages the individual to discover, exercise and rely on his or her inner resources."},
        {title: 'Radical Self-expression', text: "Radical self-expression arises from the unique gifts of the individual. No one other than the individual or a collaborating group can determine its content. It is offered as a gift to others. In this spirit, the giver should respect the rights and liberties of the recipient."},
        {title: 'Communal Effort', text: "Our community values creative cooperation and collaboration. We strive to produce, promote and protect social networks, public spaces, works of art, and methods of communication that support such interaction."},
        {title: 'Civic Responsibility', text: "We value civil society. Community members who organize events should assume responsibility for public welfare and endeavor to communicate civic responsibilities to participants. They must also assume responsibility for conducting events in accordance with local, state and federal laws."},
        {title: 'Leaving No Trace', text: "Our community respects the environment. We are committed to leaving no physical trace of our activities wherever we gather. We clean up after ourselves and endeavor, whenever possible, to leave such places in a better state than when we found them."},
        {title: 'Participation', text: "Our community is committed to a radically participatory ethic. We believe that transformative change, whether in the individual or in society, can occur only through the medium of deeply personal participation. We achieve being through doing. Everyone is invited to work. Everyone is invited to play. We make the world real through actions that open the heart."},
        {title: 'Immediacy', text: "Immediate experience is, in many ways, the most important touchstone of value in our culture. We seek to overcome barriers that stand between us and a recognition of our inner selves, the reality of those around us, participation in society, and contact with a natural world exceeding human powers. No idea can substitute for this experience. "},
    ],

    other:
    [
        "Have fun!",
        "Don't die.",
        "Safety Third"
    ],

    message: function(from, to, message)
    {
        var match = message.match(/^!p(?:rinciple)? ?([0-9]+)/);
        if(match)
        {
            var principle = match[1];
            var data = burn.principles[principle];

            if(data)
            {
                client.say(to, "Principle #" + principle + " - " + data.title + " - " + data.text);
            }
            else
            {
                var random = crypto.randomBytes(1).readUInt8(0) % burn.principles.length;
                data = burn.other[random];

                client.say(to, "Principle #" + principle + " - " + data);
            }
        }
    },

    bind: function()
    {
        for(var i = 0, l = burn.events.length; i < l; i++)
        {
            var event = burn.events[i];
            client.addListener(event, burn[event]);
        }
    },

    unbind: function()
    {
        for(var i = 0, l = burn.events.length; i < l; i++)
        {
            var event = burn.events[i];
            client.removeListener(event, burn[event]);
        }
    }
};

module.exports =
{
    load: function(_client, _core)
    {
        client = _client;
        core = _core;

        burn.bind();
    },
    
    unload: function(_client, _core)
    {
        burn.unbind();
        delete client, core, burn, crypto;
    }
}


