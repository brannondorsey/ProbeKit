// this class acts as an interface to add, store, and query MAC addresses
// using the TsharkProbeParser class. Right now it stores all of its data
// in memory, however it is written with callbacks so that it could be extended
// to use MongoDB internally without having to change its API

var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

var emitter = new EventEmitter();

function ProbeDataStore() {

	var self = this;
	
	self._probeData = {
		numMacs: 0,
		macs: {},
		networks: []
	};
}

ProbeDataStore.prototype.loadFromCSV = function(csvFilePath, callback) {

	var self = this;

	fs.readFile(csvFilePath, { encoding: 'utf8'}, function(err, data) {

		if (err) {
			callback(err);
		}
		
		var lines = data.split('\n');
		
		for (var i = 0; i < lines.length; i++) {
			var probe = lines[i].split(',');
			if (probe.length == 3) {
				addProbe(self._probeData, probe[0], probe[1], probe[2], true);
			}
		}

		callback(null);
	});	
}

// Must be called before addPacket
ProbeDataStore.prototype.isNewDevice = function(MAC, callback) {
	callback(!this._probeData.macs.hasOwnProperty(MAC));
}

ProbeDataStore.prototype.addPacket = function(packet, callback) {
	
	var self = this;

	if (packet && packet.ssid && packet.mac && packet.timestamp) {
		
		// order of operations requires that we check if the
		// device is new before we add the probe, otherwise
		// we will never know
		self.isNewDevice(packet.mac, function(isNew){

			if (isNew) {
				emitter.emit('newDevice', packet);
			}
			
			// addProbe even if device is not new
			addProbe(self._probeData, packet.mac, packet.ssid, packet.timestamp, false);
		
			if (callback) callback(null);
			return true;
		});

	} else {
		if (callback) callback(new Error('ProbeDataStore.addPacket() was not passed a valid packet object'));
		return false;
	}
}

ProbeDataStore.prototype.getAllNetworks = function(callback) {
	callback(this._probeData.networks);
}

ProbeDataStore.prototype.getNetworks = function(MAC, callback) {
	
	var self = this;
	
	if (self._probeData.macs.hasOwnProperty(MAC)) {

		callback(self._probeData.macs[MAC].knownNetworks);

	} else {
		callback(null);
	}
}

ProbeDataStore.prototype.getDevicesAsArray = function(callback) {
	callback(Object.keys(this._probeData.macs));
}

ProbeDataStore.prototype.getNumNetworks = function(callback) {
	callback(this._probeData.networks.length);
}

ProbeDataStore.prototype.getNumDevices = function(callback) {
	callback(Object.keys(this._probeData.macs).length);
}

ProbeDataStore.prototype.on = function(eventName, func) {

	if (eventName == 'newDevice') {
		emitter.addListener(eventName, func);
	} else {
		throw new Error('ProbeDataStore::on ' + eventName + ' is not a valid ProbeDataStore event');
	}
}

function addProbe(probeData, mac, ssid, timestamp, fromCSV) {

	var isNewDevice = false;

	if (!probeData.macs.hasOwnProperty(mac)) {
		probeData.macs[mac] = {};
		probeData.macs[mac].knownNetworks = [];
		probeData.macs[mac].lastSeen = 0;
		probeData.macs[mac].timesSeen = 0;
		probeData.macs[mac].mac = mac;
		probeData.numMacs++;
		isNewDevice = true;
	}

	probeData.macs[mac].lastSeen = timestamp;
	probeData.macs[mac].timesSeen++;

	if (probeData.macs[mac].knownNetworks.indexOf(ssid) == -1) {
		probeData.macs[mac].knownNetworks.push(ssid);
	}

	if (probeData.networks.indexOf(ssid) == -1) {
		probeData.networks.push(ssid);
	}

	onProbeAdded(mac, ssid, timestamp, fromCSV, isNewDevice);
}

function onProbeAdded(mac, ssid, timestamp, fromCSV, isNewDevice) {

}

module.exports = ProbeDataStore;