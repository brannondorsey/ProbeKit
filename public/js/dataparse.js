//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 
//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 
// Brannon's sockets magix ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 
//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 
//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 

var probeData = {
	numMacs: 0,
	macs: {}
};

var filter = {
    manufacturer: "",
    networks: [],
    time: {}
};

var rawCSV = undefined;

var vendorDictionary = {};
createVendorDictionary();

$.ajax({
  	url: "data/probes.csv",
  	success: function(data) {
	  rawCSV = data;
	  parseCSVToProbeData();
	  applyFilter();
  	},
  	error: function(err){
  		throw err;
  	}
});

var socket = io.connect("http://" + window.location.host);
socket.on('probeReceived', function (probe) {
    // add the probe to our master probeData object
    addProbe(probe.mac, probe.ssid, probe.timestamp, false);
});

function createVendorDictionary() {
	
	if (vendor) {
		for (var i = 0; i < vendor.mapping.length; i++) {
			if (!vendorDictionary.hasOwnProperty(vendor.mapping[i].mac_prefix)) {
				vendorDictionary[vendor.mapping[i].mac_prefix] = vendor.mapping[i].vendor_name;
			}
		}
	}
}

function parseCSVToProbeData() {

	if (rawCSV != undefined) {
		var lines = rawCSV.split('\n');
		for (var i = 0; i < lines.length; i++) {
			var probe = lines[i].split(',');
			if (probe.length == 3) {
				addProbe(probe[0], probe[1], probe[2], true);
			}
		}
	}
}

function addProbe(mac, ssid, timestamp, fromCSV) {
	
	onBeforeProbeAdded(mac, ssid, timestamp, fromCSV);

	if (!probeData.macs.hasOwnProperty(mac)) {
		probeData.macs[mac] = {};
		probeData.macs[mac].knownNetworks = [];
		probeData.macs[mac].lastSeen = 0;
		probeData.macs[mac].timesSeen = 0;
		probeData.macs[mac].mac = mac;
		probeData.numMacs++;
	}

	probeData.macs[mac].lastSeen = timestamp;
	probeData.macs[mac].timesSeen++;
	if (probeData.macs[mac].knownNetworks.indexOf(ssid) == -1) {
		probeData.macs[mac].knownNetworks.push(ssid);
	}

	onProbeAdded(mac, ssid, timestamp, fromCSV);
}

function onBeforeProbeAdded(mac, ssid, timestamp, fromCSV) {
	if(probeData.macs.hasOwnProperty(mac)) {
		flapButterfly(mac, ssid);					
	} else {
		makeButterfly(mac, ssid);								
	}
}

function onProbeAdded(mac, ssid, timestamp, fromCSV) {
	var time = moment(parseInt(timestamp)).format('YYYY-MM-DD HH:mm:ss');
	//$('#dump').prepend(time + '    MAC: ' + mac + '    SSID: ' + ssid + '\n');
}

// Filtering
//////////////////////////////////////////////////////////////////////////

// update the DOM with butterflies that pass filter
function applyFilter() {

	var macs = getFilteredMacs();
	
	// clear #net
	$('#net').empty();
	
	if (macs.length > 0) {
		for (var i = 0; i < macs.length; i++) {
			makeButterfly( macs[i].mac, macs[i].knownNetworks );
		}
	} else {
		// no results...
	}
}

// resets the global filter var
function clearFilter() {

	filter = {
	    manufacturer: "",
	    networks: [],
	    time: {}
	};
}

// returns an array of macs that pass all filters
function getFilteredMacs() {
	
	// get an array of filtered mac addresses
	return _.filter(probeData.macs, function(macObj, mac){

		// filter networks
		if (filter.networks.length > 0 && 
			!_.some(macObj.knownNetworks, function(network){ return _.contains(filter.networks, network) })){
			return false;
		};

		// filter manufacturer
		if (filter.manufacturer != "" && 
			(!vendorDictionary.hasOwnProperty(mac.substring(0, 8).toUpperCase()) || vendorDictionary[mac.substring(0, 8).toUpperCase()] != filter.manufacturer)) {
			return false;
		}

		// TODO: filter using all collected timestamps
		if (filter.time.from != undefined && 
			filter.time.to != undefined &&
			!(macObj.lastSeen >= filter.time.from && macObj.lastSeen <= filter.time.to)) {
			return false;
		}

		return true;
	});
}
