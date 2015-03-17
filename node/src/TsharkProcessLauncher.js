var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;

function TsharkProcessLauncher(interface, hopChannels) {
	
	this.channelHopProcess = undefined;
	this.tsharkProcess = undefined;

	if (!interface) {
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
	proc = spawnSync('ifconfig',  [interface, 'down']);
	if (proc.status != 0) {
		console.log(proc.stderr);
		console.log('ifconfig could not take down ' + interface + ', make sure that it is not already in use.');
		process.exit(1);
	}

	// put the device into monitor mode
	proc = spawnSync('iwconfig',  [interface, 'mode', 'monitor']);
	if (proc.status != 0) {
		console.log(proc.stderr);
		console.log('iwconfig could set ' + interface + ' to monitor mode, make sure that it is not already in use.');
		process.exit(1);
	}

	// set device up
	proc = spawnSync('ifconfig',  [interface, 'up']);
	if (proc.status != 0) {
		console.log(proc.stderr);
		console.log('ifconfig could not bring up ' + interface + ', make sure that it is not already in use.');
		process.exit(1);
	}

	if (hopChannels) this.channelHopProcess = spawn(__dirname + '/../../shell/channel_hop.sh', [interface]);
	this.tsharkProcess = spawn('tshark', ['-i', interface, '-n', '-I', '-l', 'subtype', 'probereq']);
}

module.exports = TsharkProcessLauncher;