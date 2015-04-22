var ProbeDataStore = require(__dirname + '/../src/ProbeDataStore');
var _ = require('underscore');

var probeDataStore = new ProbeDataStore(__dirname + '/../../data/probes.csv', function(err){

	if (err) throw err;

	probeDataStore.getNumDevices(function(numDevices){
		
		if (numDevices) {
			
			console.log(numDevices + ' unique devices found.');

			var networks = [];

			var afterFunc = _.after(numDevices - 1, function(){
				
				for (var i = 0; i < networks.length; i++) {
					console.log(networks[i]);
				}

				console.log(networks.length + ' networks found (this figure is not uniq).');
			});

			var counter = 0;
			probeDataStore.getDevicesAsArray(function(devices){

				for (var i = 0; i < devices.length; i++) {
					
					if (devices) {
						
						probeDataStore.getNetworks(devices[i], function(nets) {
							if (nets) {
								networks = networks.concat(nets);
							}
						});
					}

					afterFunc();
				}
			});
		}
	});
});