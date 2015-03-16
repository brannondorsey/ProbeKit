var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

var emitter = new EventEmitter();

function TsharkProbeParser() {

}

TsharkProbeParser.prototype.parseLine = function(TsharkLine) {
	
	var packet = this.parse(TsharkLine);

	if (packet) {
	 	emitter.emit('probeReceived', packet);
	 	return true;
	}

	return false;
}

TsharkProbeParser.prototype.parseFile = function(path, callback) {

	var self = this;

	function readLines(input, func) {
	  
		var remaining = '';

		input.on('data', function(data) {
		    remaining += data;
		    var index = remaining.indexOf('\n');
		    while (index > -1) {
		      var line = remaining.substring(0, index);
		      remaining = remaining.substring(index + 1);
		      func(line);
		      index = remaining.indexOf('\n');
		    }
		 });

		input.on('end', function() {
		    
		    if (remaining.length > 0) {
		      func(remaining);
		    }

		    callback();
		});
	}

	// called on every line
	function func(data) {
	 	self.parseLine(data);
	}

	var input = fs.createReadStream(path, { encoding: 'utf8' });
	readLines(input, func);
}

TsharkProbeParser.prototype.parse = function(TsharkLine) {
	
	var output = {};

	var ssidRE = /SSID=.+$/;
	var macRE = /[\da-f]{2}:[\da-f]{2}:[\da-f]{2}:[\da-f]{2}:[\da-f]{2}:[\da-f]{2}/;

	var ssid = TsharkLine.match(ssidRE);

	if (ssid) {

		ssid = ssid[0].substring(5);
		
		if (ssid != 'Broadcast' &&
			ssid.indexOf('[Malformed Packet]') == -1 &&
			ssid.indexOf('[truncated]') == -1 &&
			ssid.match(/\s\s/) == undefined) {

			var mac = TsharkLine.match(macRE);

			if (mac) {
				
				output.ssid = ssid;
				output.mac = mac[0];
				output.timestamp = new Date().getTime();

				return output;
			}
		}
	}

	return null;
}

TsharkProbeParser.prototype.on = function(eventName, func) {

	if (eventName == 'probeReceived') {
		emitter.addListener(eventName, func);
	} else {
		throw new Error('TsharkProbeParser::on ' + eventName + ' is not a valid TsharkProbeParser event');
	}
}

module.exports = TsharkProbeParser;

