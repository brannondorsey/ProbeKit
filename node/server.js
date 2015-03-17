var fs = require('fs');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var argv = require('minimist')(process.argv.slice(2));
var moment = require('moment');
var TsharkProbeParser = require('./src/TsharkProbeParser');
var TsharkProcessLauncher = require('./src/TsharkProcessLauncher');

if (argv.interface == undefined) {
	console.log('Usage: node scriptname --interface=<interface_name> [--output=probes.csv]');
	process.exit(1);
}

var outputFile = argv.output || __dirname + '/../data/probes.csv';

var probeParser = new TsharkProbeParser();
var procLauncher = new TsharkProcessLauncher(argv.interface, true);
var tsharkProcess = procLauncher.tsharkProcess;
var channelHopProcess = procLauncher.channelHopProcess;
var writeStream = fs.createWriteStream(outputFile, { flags: 'a', encoding: 'utf8' });

tsharkProcess.stdout.on('data', function (data) {
	
	var lines = data.toString('utf8').split('\n');
	
	for (var i = 0; i < lines.length; i++) {
		// this will fire the probeParser.on('probeReceived') event
		// if the packet is parsed successfully
		probeParser.parseLine(lines[i]);
	}
});

tsharkProcess.stderr.on('data', function (data) {
  	console.log('stderr: ' + data);
});

tsharkProcess.on('close', function (code) {
  	console.log('tshark process exited with code ' + code);
  	writeStream.close();
});

// register event first
probeParser.on('probeReceived', function(packet){
	
	var csvLine = packet.mac + ',' + packet.ssid + ',' + packet.timestamp + '\n'
	writeStream.write(csvLine);

	console.log(moment(packet.timestamp).format('YYYY-MM-DD HH:mm:ss') + '    MAC: ' + packet.mac + '    SSID: ' + packet.ssid);
});

app.use('/data', express.static(__dirname + '/../data'));
app.use(express.static(__dirname + '/../public'));

io.on('connection', function (socket) {
    probeParser.on('probeReceived', function(probe){
  		socket.emit('probeReceived', probe);
    });
});

server.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Server listening at http://%s:%s', host, port)

});