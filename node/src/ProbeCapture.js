var fs = require('fs');
var pcap = require('pcap');
var EventEmitter = require('events').EventEmitter;

var emitter = new EventEmitter();

function ProbeCapture(interface) {

	try {
		this._pcapSession = pcap.createSession(interface, 'type mgt subtype probe-req', 2097152, true);
	} catch (err) {
		console.log('ERROR');
		console.log(err);
	}

	if (this._pcapSession) {

			this._pcapSession.on("packet", function (raw_packet) {

		    try {
		        var packet = pcap.decode.packet(raw_packet);
		    } catch (err) {
		        console.log('[ error ] Packet decode error: ' + err);
		    }

		    if (typeof packet !== 'undefined' && 
		        typeof packet.payload !== 'undefined' &&
		        typeof packet.payload.ieee802_11Frame !== 'undefined' &&
		        typeof packet.payload.ieee802_11Frame.probe !== 'undefined' &&
		        typeof packet.payload.ieee802_11Frame.probe.tags !== 'undefined' &&
		        packet.payload.ieee802_11Frame.probe.tags.length > 0 &&
		        typeof packet.payload.ieee802_11Frame.shost !== 'undefined') {

		        var frame = packet.payload.ieee802_11Frame;
		        var tags = frame.probe.tags;
		        var ssid = tags[0].ssid;
		        
		        if (typeof ssid !== 'undefined' && ssid !== '') {

		        	var packet = {
		        		ssid: ssid,
		        		mac:  formatMAC(frame.shost.addr),
		        		timestamp: new Date().getTime()
		        	};

		        	emitter.emit('probeReceived', packet);
		        }
		    }
		});
	}

	function formatMAC(arr) {
	    return arr.map(function(octet){ 
	        return ("00" + octet.toString(16)).slice(-2); 
	    }).join(':');
	}
}

// ProbeParser.prototype.parseLine = function(TsharkLine) {
	
// 	var packet = this.parse(TsharkLine);

// 	if (packet != null) {
// 	 	emitter.emit('probeReceived', packet);
// 	 	return true;
// 	}

// 	return false;
// }

// ProbeParser.prototype.parseFile = function(path, callback) {

// 	var self = this;

// 	function readLines(input, func) {
	  
// 		var remaining = '';

// 		input.on('data', function(data) {
// 		    remaining += data;
// 		    var index = remaining.indexOf('\n');
// 		    while (index > -1) {
// 		      var line = remaining.substring(0, index);
// 		      remaining = remaining.substring(index + 1);
// 		      func(line);
// 		      index = remaining.indexOf('\n');
// 		    }
// 		 });

// 		input.on('end', function() {
		    
// 		    if (remaining.length > 0) {
// 		      func(remaining);
// 		    }

// 		    callback();
// 		});
// 	}

// 	// called on every line
// 	function func(data) {
// 	 	self.parseLine(data);
// 	}

// 	var input = fs.createReadStream(path, { encoding: 'utf8' });
// 	readLines(input, func);
// }

// ProbeParser.prototype.parse = function(TsharkLine) {
	
// 	var output = {};
// 	var ssidRE = /SSID=.+$/;
// 	var macRE = /[\da-f]{2}:[\da-f]{2}:[\da-f]{2}:[\da-f]{2}:[\da-f]{2}:[\da-f]{2}/;

// 	var ssid = TsharkLine.match(ssidRE);

// 	if (ssid) {

// 		ssid = ssid[0].substring(5);
		
// 		if (ssid != 'Broadcast' &&
// 			ssid.indexOf('[Malformed Packet]') == -1 &&
// 			ssid.indexOf('[truncated]') == -1 &&
// 			ssid.match(/\s\s/) == undefined) {

// 			var mac = TsharkLine.match(macRE);

// 			if (mac) {
				
// 				output.ssid = ssid;
// 				output.mac = mac[0];
// 				output.timestamp = new Date().getTime();

// 				return output;
// 			}
// 		}
// 	}

// 	return null;
// }

ProbeCapture.prototype.on = function(eventName, func) {

	if (eventName == 'probeReceived') {
		emitter.addListener(eventName, func);
	} else {
		throw new Error('ProbeCapture::on ' + eventName + ' is not a valid ProbeCapture event');
	}
}

ProbeCapture.prototype.close = function() {
	if (this._pcapSession) this._pcapSession.close();
	console.log('[ server ] ProbeCapture::close: closed packet capture');
}

module.exports = ProbeCapture;

