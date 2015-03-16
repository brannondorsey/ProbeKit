var spawn = require('child_process').spawn;
var argv = require('minimist')(process.argv.slice(2));

if (argv.interface == undefined) {
	console.log('Usage: node scriptname --interface=<interface_name>');
	process.exit(1);
}

var TsharkProbeParser = require('./src/TsharkProbeParser');
var probeParser = new TsharkProbeParser();

tsharkProcess = spawn('tshark', ['-i', argv.interface, '-n', '-I', '-l']); //, 'subtype', 'probereq'

// tshark should be line buffered with -l flag
tsharkProcess.stdout.on('data', function (data) {
	probeParser.parseLine(data + '');
});

tsharkProcess.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

tsharkProcess.on('close', function (code) {
  console.log('child process exited with code ' + code);
});

// register event first
probeParser.on('probeReceived', function(packet){
	console.log(packet.mac + ',' + packet.ssid + ',' + packet.timestamp);
});