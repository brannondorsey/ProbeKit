var wigle = require('./wigle-api');
var _ = require('underscore');

function WigleBatchDownloader(username, password, callback) {
	
	var self = this;
	self.requestTimeout = 2000; // request timeout so as not to bog down server
	self.maxConcurrentRequests = 100;
	self.downloading = false;

	self.wigleClient = wigle.createClient(username, password, callback);
}

// EXAMPLE OPTIONS
// NOTE: FILTER OPTIONS ARE A LIMITED SET OF API PARAMS
// var options = {
// 	chunkSize: "",
// 	fence: {
// 		latrange1: "",
// 		latrange2: "",
// 		longrange1: "",
// 		longrange2: ""
// 	},
// 	filter {
// 		ssid: "",
// 		lastupdt: "",
// 		netid: "",
// 		freenet: "",
// 		paynet: "",
// 		dhcp: "",
// 		onlymine: ""
// 	}
// }
WigleBatchDownloader.prototype.download = function(options, callback){
	
	var self = this;

	self.downloading = true;

	var chunkObjs = self.getChunkObjects(parseFloat(options.fence.latrange1),
										 parseFloat(options.fence.latrange2),
										 parseFloat(options.fence.longrange1),
										 parseFloat(options.fence.longrange2),
										 parseFloat(options.chunkSize));
	
	var numRequests = 10; // chunkObjs.length;
	var afterCallback = _.after(numRequests, callback);
	var allNetworks = [];

	// for (var i = 0; i < chunkObjs.length; i++) {
	for (var i = 0; i < 10; i++) {
		
		var chunk = chunkObjs[i];
		
		if (options.filter) {
			var filer = options.filter;
			if (filter.ssid) chunk.ssid         = filter.ssid;
			if (filter.lastupdt) chunk.lastupdt = filter.lastupdt;
			if (filter.netid) chunk.netid       = filter.netid;
			if (filter.freenet) chunk.freenet   = filter.freenet;
			if (filter.paynet) chunk.paynet     = filter.paynet;
			if (filter.dhcp) chunk.dhcp         = filter.dhcp;
			if (filter.onlymine) chunk.onlymine = filter.onlymine;
		}

		chunk.simple = true;
		
		self.wigleClient.query(chunk, function(err, result) {
			
			if (err) throw err;
			
			console.log('Timestamp:', result.timestamp);
			console.log('Number of networks found:', result.networks.length);
			// console.log('Networks:', result.networks);
			allNetworks.concat(result.networks);
			afterCallback(allNetworks);
		});
	}
}

WigleBatchDownloader.prototype.getChunkObjects = function(latrange1, latrange2, longrange1, longrange2, chunkSize) {

	var chunkObjs = [];
	// latrange1 must always be less than latrange2 and
	// longrange1 must always be less than longrange2
	for (var x = latrange1; x < latrange2; x += chunkSize) {
		for (var y = longrange1; y < longrange2; y += chunkSize) {
			chunkObjs.push({
				latrange1: x,
				latrange2: x + chunkSize,
				longrange1: y,
				longrange2: y + chunkSize
			});
		}
	}

	return chunkObjs;
}

module.exports = WigleBatchDownloader;
