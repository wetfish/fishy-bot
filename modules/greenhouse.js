/* 
 * Send greenhouse sensor data to IRC
 */

var greenhouse =
{
    init: function() 
    {
        const { SerialPort } = require('serialport');
        const ReadLine = require('readline');

        const port = new SerialPort({
            path: '/dev/ttyACM0',
            baudRate: 9600,
        })

        const lineReader = ReadLine.createInterface({
            input: port
        });

        lineReader.on('line', function (line) {
            try {
                const sensorData = JSON.parse(line);
                sensorData.timestamp = new Date().toISOString();
                console.log(JSON.stringify(sensorData));
                greenhouse.client.say('#greenhouse', JSON.stringify(sensorData));
            } catch(error) {
                console.error(error);
            }
        });

        port.on('error', function(err) {
            console.error('Error:', err.message);
        });
    },
};

module.exports =
{
    load: function(client, core)
    {
        greenhouse.client = client;
        greenhouse.core = core;

        // Wait 10 seconds after boot so the bot can join channels

        setTimeout(function() {
            greenhouse.init();
        }, 10 * 1000);
    },

    unload: function()
    {
        // no op?
    }
}
