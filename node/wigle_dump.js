var fs = require('fs');
var WigleBatchDownloader = require('./src/WigleBatchDownloader');

// 46ea0d5b2
var batchDownloader = new WigleBatchDownloader('46ea0d5b2', '46ea0d5b2', function(){
	// fires on wigle.net login

	var options = {
		verbose: true,
		chunkSize: 0.005,
		requestTimeout: 1000 * 10, // 1 minute between requests to not bog down server
		fence: {
			latrange1: 41.8756, // must be less than latrange2
			latrange2: 41.8864,
			longrange1: -87.6365, // must be less than longrange2
			longrange2: -87.6242
		},
		// filter: {
		// 	lastupdt: 20100101000000 // format: YYYYMMDDHHMMSS
		// }
	}

	batchDownloader.download(options, onRequestFinished, onAllNetworksDownloaded);

	function onRequestFinished(result) {
		// result.timestamp, result.networks
		console.log('Query returned ' + result.networks.length + ' at ' + result.timestamp);
	}

	function onAllNetworksDownloaded(allNetworks) {
		console.log('All queries have returned. ' + allNetworks.length + ' downloaded.');
		var filename = __dirname + '/../data/wigle_data/' + options.fence.latrange1 
			+ '_' + options.fence.latrange2 + '_' + options.fence.longrange1 + '_' 
			+ options.fence.longrange2 + '.json';

		fs.writeFile(filename, JSON.stringify(allNetworks), function(err){

			if (err) throw err;
			console.log(allNetworks.length + ' networks saved to ' + filename);
			process.exit(0);
		});
	}

});
