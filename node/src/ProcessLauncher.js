var os = require('os');
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;

function ProcessLauncher(interface, hopChannels, settings) {

	this.channelHopProcess = undefined;
	this.mongodProcess     = undefined;

	var mongodPath = settings.mongodPath || '/usr/local/bin/mongod';

	if (!interface) {
		console.log('Usage: node scriptname --interface=<interface_name> [--output=probes.csv]');
		process.exit(1);
	}

	// check for ifconfig
	// var proc = spawnSync('which', ['ifconfig'], { encoding: 'utf8' });
	// if (proc.status != 0) {
	// 	console.log('ifconfig not found, please install ifconfig');
	// 	process.exit(1);
	// }

	// if (os.type() == 'Linux') {
	// 	// check for iwconfig
	// 	proc = spawnSync('which', ['iwconfig'], { encoding: 'utf8' });
	// 	if (proc.status != 0) {
	// 		console.log('iwconfig not found, please install iwconfig');
	// 		process.exit(1);
	// 	}
	// }

	// check for tshark
	// proc = spawnSync('/usr/bin/which', ['tshark'], { encoding: 'utf8' });
	// if (proc.status != 0) {
	// 	console.log('tshark not found, please install tshark with:\n\tsudo apt-get install tshark');
	// 	process.exit(1);
	// }

	// // set device down
	// proc = spawnSync('ifconfig',  [interface, 'down'], { encoding: 'utf8' });
	// if (proc.status != 0) {
	// 	console.log(proc.stderr);
	// 	console.log('ifconfig could not take down ' + interface + ', make sure that it is not already in use.');
	// 	process.exit(1);
	// }

	// if (os.type() == 'Linux') {
	// 	// put the device into monitor mode
	// 	proc = spawnSync('iwconfig',  [interface, 'mode', 'monitor'], { encoding: 'utf8' });
	// 	if (proc.status != 0) {
	// 		console.log(proc.stderr);
	// 		console.log('iwconfig could set ' + interface + ' to monitor mode, make sure that it is not already in use.');
	// 		process.exit(1);
	// 	}
	// }

	// // set device up
	// proc = spawnSync('ifconfig',  [interface, 'up'], { encoding: 'utf8' });
	// if (proc.status != 0) {
	// 	console.log(proc.stderr);
	// 	console.log('ifconfig could not bring up ' + interface + ', make sure that it is not already in use.');
	// 	process.exit(1);
	// } 

	if (hopChannels) this.channelHopProcess = spawn(__dirname + '/../../shell/channel_hop.sh', [interface]);
	this.mongodProcess = spawn(mongodPath);
}

ProcessLauncher.prototype.close = function(code) {

	var self = this;

	if (self.mongodProcess !== undefined) {
		self.mongodProcess.kill('SIGTERM');
		console.log('[ server ] ProcessLauncher::close: sent to mongoProcess');
	}

	if (self.channelHopProcess !== undefined) {
		self.channelHopProcess.kill('SIGTERM');
		console.log('[ server ] ProcessLauncher::close: sent to channelHopProcess');
	}
}

module.exports = ProcessLauncher;
