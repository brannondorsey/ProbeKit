var fs = require('fs');
var moment = require('moment');
var argv = require('minimist')(process.argv.slice(2));
var TsharkProbeParser = require('./src/TsharkProbeParser');
var ProcessLauncher = require('./src/ProcessLauncher');

var outputFile = argv.output || __dirname + '/../data/probes.csv';
var writeStream = fs.createWriteStream(outputFile, { flags: 'a', encoding: 'utf8' });

if (argv.interface == undefined) {
	console.log('Usage: node scriptname --interface=<interface_name> [--output=probes.csv]');
	process.exit(1);
}

var probeParser = new TsharkProbeParser();
var procLauncher = new ProcessLauncher(argv.interface, true);
var tsharkProcess = procLauncher.tsharkProcess;
var channelHopProcess = procLauncher.channelHopProcess;

if (channelHopProcess != undefined) {
	
	channelHopProcess.stdout.on('data', function (data) {
		// console.log('[channel_hop.sh]: ' + data.toString());
	});

	channelHopProcess.stderr.on('data', function (data) {
		console.log('[channel_hop.sh ERROR]' + data.toString());
	});
}

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