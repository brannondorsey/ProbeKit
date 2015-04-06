var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var _ = require('underscore');
var WigleBatchDownloader = require('./src/WigleBatchDownloader');

var username = argv.username || argv.u || '46ea0d5b2';
var password = argv.password || argv.p || '46ea0d5b2';
var lastupdt = argv.lastupdt || argv.l;
var latrange1 = argv.latrange1 || argv.w;
var latrange2 = argv.latrange2 || argv.e;
var longrange1 = argv.longrange1 || argv.n;
var longrange2 = argv.longrange2 || argv.s;
var chunkSize = argv.chunkSize || argv.c;

var filter = null;

if (!(latrange1 && latrange2 && longrange1 && longrange2)) {
	console.log('Usage: node wigle_dump.js' + ' <required> [options]');
	console.log('Required:');
	console.log('    --latrange1=<latrange1>, -w <latrange1>');
	console.log('    --latrange2=<latrange2>, -e <latrange2>');
	console.log('    --longrange1=<longrange1>, -n <longrange1>');
	console.log('    --longrange2=<longrange2>, -s <longrange2>');
	console.log();
	console.log('Options:');
	console.log('    --username=[username], -u [username]     Wigle.net username.');
	console.log('    --password=[password], -c [password]     Wigle.net password.');
	console.log('    --chunkSize=[chunkSize], -c [chunkSize]  Set the chunkSize. i.e. 0.005');
	console.log('    --lastupdt=[lastupdt], -l [lastupdt]     Search only networks found since YYYYMMDDHHMMSS. i.e. 20100101000000');
	process.exit(1);
}

latrange1 = parseFloat(latrange1);
latrange2 = parseFloat(latrange2);
longrange1 = parseFloat(longrange1);
longrange2 = parseFloat(longrange2);

if (chunkSize) {
	chunkSize = parseFloat(chunkSize);
}

// if filter parameters
if (lastupdt) {
	filter = {
		lastupdt: parseInt(lastupdt)
	};
}

var batchDownloader = new WigleBatchDownloader(username, password, function(err){
	
	// fires on wigle.net login or (err on login failed
	if (err) {
		console.log('Login failed using username: ' + username + ' password: ' + password);
		process.exit(1);
	}

	var options = {
		verbose: true,
		chunkSize: chunkSize || 0.005,
		requestTimeout: 1000 * 10, // 1 minute between requests to not bog down server
		fence: {
			latrange1: latrange1, // must be less than latrange2
			latrange2: latrange2,
			longrange1: longrange1, // must be less than longrange2
			longrange2: longrange2
		}
	}

	if (filter) {
		options.filter = filter;
	}

	batchDownloader.download(options, onRequestFinished, onAllNetworksDownloaded);

	function onRequestFinished(err, result) {
		// result.timestamp, result.networks
		if (err) {
			console.log('[error] request error received, terminating future network downloads: ' + error);
			return false;
		}

		console.log('[info] Query returned ' + result.networks.length + ' at ' + result.timestamp);
		return true; // must return true to continue downloading		
	}

	function onAllNetworksDownloaded(err, allNetworks) {

		if (err) {
			console.log('[error] network download was ended abruptly ' + err);
		} else {
			console.log('[info] All queries have returned. ' + allNetworks.length + ' downloaded.');
		}

		var filename = __dirname + '/../data/wigle_data/' + options.fence.latrange1 
			+ '_' + options.fence.latrange2 + '_' + options.fence.longrange1 + '_' 
			+ options.fence.longrange2 + '.json';

		allNetworks = _.uniq(allNetworks);
		console.log('[info]' + allNetworks.length + ' unique networks downloaded.');

		fs.writeFile(filename, JSON.stringify(allNetworks), function(err){

			if (err) throw err;
			console.log('[info]' + allNetworks.length + ' networks saved to ' + filename);
			process.exit(0);
		});
	}

});
