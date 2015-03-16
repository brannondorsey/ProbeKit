var TsharkProbeParser = require('./src/TsharkProbeParser');

var probeParser = new TsharkProbeParser();

var csvString = '';

// register event first
probeParser.on('probeReceived', function(packet){
	csvString += packet.mac + ',' + packet.ssid + ',' + packet.timestamp + '\n';
});

// then output csv to stdout
probeParser.parseFile(__dirname + '/../data/tshark_out.txt', function(){
	console.log(csvString);
});
