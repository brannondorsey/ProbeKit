noble = require('noble')

noble.on('stateChange', function(state) {
	console.log("Status: " + state);
	if (state === 'poweredOn') {
		console.log("Scanning...");
		noble.startScanning();
	} else {
		console.log("Stoping...");
		noble.stopScanning();
	}
});

noble.on('discover', function(peripheral) {
	console.log('Found device with local name: ' + peripheral.advertisement.localName,' and id: ' + peripheral._noble.address);
	console.log('Advertising the following service uuid\'s: ' + peripheral.advertisement.serviceUuids);
	Object.keys(peripheral.advertisement).forEach(function (key) {
		var val = peripheral.advertisement[key];
		console.log(key, ': ' + val);
	});
	console.dir(peripheral, {depth: null, colors: true});
	console.log();
});
