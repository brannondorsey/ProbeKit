// var argv = require('minimist')(process.argv.slice(2));

// var outputFile = argv.output || __dirname + '/../data/probes.csv';
// var writeStream = fs.createWriteStream(outputFile, { flags: 'a', encoding: 'utf8' });

// if (argv.interface == undefined) {
// 	console.log('Usage: node scriptname --interface=<interface_name> [--output=probes.csv]');
// 	process.exit(1);
// }

var WigleBatchDownloader = require('./src/WigleBatchDownloader');

var batchDownloader = new WigleBatchDownloader('46ea0d5b2', '46ea0d5b2', function(){
	// fires on wigle.net login

	var options = {
		chunkSize: 0.005,
		fence: {
			latrange1: 41.8489,
			latrange2: 41.9141,
			longrange1: -87.7357,
			longrange2: -87.5383
		}
		// filter: {
		// 	ssid: "",
		// 	lastupdt: "",
		// 	netid: "",
		// 	freenet: "",
		// 	paynet: "",
		// 	dhcp: "",
		// 	onlymine: ""
		// }
	}

	batchDownloader.download(options, function(networks){
		console.log('Download finished, ' + networks.length + ' networks downloaded.');
	});
});
