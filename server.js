var osc = require('osc'),
    express = require('express'),
    ws = require('ws');

function getIPAddresses(){
    var os = require('os'),
        interfaces = os.networkInterfaces(),
        addresses = [];

    for(var ni in interfaces){
        var props = interfaces[ni];
        for(var i = 0; i < props.length; i++){
            if(props[i].family === 'IPv4' && !props[i].internal){
                addresses.push(props[i].address);
            };
        };
    };

    return addresses;
};

var port = process.env.PORT || 8081;

var udpPort = new osc.UDPPort({
    localAddress: '0.0.0.0',
    localPort: (process.env.UDPPort || 5000)
});

udpPort.on('ready', () => {
    var ipAddresses = getIPAddresses();

    if(ipAddresses.length && ipAddresses.length === 1){
        udpPort.options.localAddress = ipAddresses[0];
    } else {
        throw new Error('Unable to retrieve IP.')
    };

    console.log(`Make sure OSC server is streaming at: \x1b[36m${udpPort.options.localAddress}:${udpPort.options.localPort}\n\x1b[0mListening on \x1b[36m${port}\x1b[0m..`);
});

udpPort.on('error', err => {
    console.log('Error occurred with udp port: ', err.message);
});

udpPort.open();

var app = express(),
    server = app.listen(port),
    wss = new ws.Server({
        server: server
    });

app.use('/', express.static(__dirname));

wss.on('connection', socket => {
    var socketPort = new osc.WebSocketPort({
        socket: socket
    });

    var relay = new osc.Relay(udpPort, socketPort, {
        raw: true
    });
});