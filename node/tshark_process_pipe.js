var fs = require('fs');
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var moment = require('moment');
var argv = require('minimist')(process.argv.slice(2));
var TsharkProbeParser = require('./src/TsharkProbeParser');

if (argv.interface == undefined) {
	console.log('Usage: node scriptname --interface=<interface_name> [--output=probes.csv]');
	process.exit(1);
}

// check for ifconfig
var proc = spawnSync('which', ['ifconfig']);
if (proc.status != 0) {
	console.log('ifconfig not found, please install ifconfig');
	process.exit(1);
}

// check for iwconfig
proc = spawnSync('which', ['iwconfig']);
if (proc.status != 0) {
	console.log('iwconfig not found, please install iwconfig');
	process.exit(1);
}

// check for tshark
proc = spawnSync('which', ['tshark']);
if (proc.status != 0) {
	console.log('tshark not found, please install tshark with:\n\tsudo apt-get install tshark');
	process.exit(1);
}

// set device down
proc = spawnSync('ifconfig', [argv.interface, 'down']);
if (proc.status != 0) {
	console.log(proc.stderr);
	console.log('ifconfig could not take down ' + argv.interface + ', make sure that it is not already in use.');
	process.exit(1);
}

// put the device into monitor mode
proc = spawnSync('iwconfig', [argv.interface, 'mode', 'monitor']);
if (proc.status != 0) {
	console.log(proc.stderr);
	console.log('iwconfig could set ' + argv.interface + ' to monitor mode, make sure that it is not already in use.');
	process.exit(1);
}

// set device up
proc = spawnSync('ifconfig', [argv.interface, 'up']);
if (proc.status != 0) {
	console.log(proc.stderr);
	console.log('ifconfig could not bring up ' + argv.interface + ', make sure that it is not already in use.');
	process.exit(1);
}

var outputFile = argv.output || __dirname + '/../data/probes.csv';
var writeStream = fs.createWriteStream(outputFile, { flags: 'a', encoding: 'utf8' });
var probeParser = new TsharkProbeParser();

// set interface to hop channels
var channelHopProcess = spawn(__dirname + '/../shell/channel_hop.sh', [argv.interface]);

channelHopProcess.stdout.on('data', function (data) {
	console.log('[channel_hop.sh]: ' + data.toString());
});

channelHopProcess.stderr.on('data', function (data) {
	console.log('[channel_hop.sh ERROR]' + data.toString());
});

// launch tshark
var tsharkProcess = spawn('tshark', ['-i', argv.interface, '-n', '-I', '-l', 'subtype', 'probereq']);

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

	console.log('MAC:  ' + packet.mac);
	console.log('SSID: ' + packet.ssid);
	console.log('Time: ' + moment(packet.timestamp).format('YYYY-MM-DD HH:mm:ss'));
	console.log();
});