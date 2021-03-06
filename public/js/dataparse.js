//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~
//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~
// Brannon's sockets magix ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~
//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~
//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~

var probeData = {
	numMacs: 0,
	macs: {},
	networks: []
};

var filter = {
    manufacturer: "",
    networks: [],
    time: {}
};

var rawCSV = undefined;
var vendorDictionary = undefined;

$.ajax({
  	url: "data/probes.csv",
  	success: function(data) {
	  rawCSV = data;
	  loadVendorMacs(function(err, result){
	  	  
	  	  if (err) {
	      		console.log("Error loading vendorMacs.json:");
	      		console.log(err);
	      }

	      vendorDictionary = result;
	      var then = new Date();
	      parseCSVToProbeData();
	      var now = new Date();
	      // console.log(moment(now) - moment(then));
	  	  applyFilter();
	  	  initPositions();
	  });
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

function loadVendorMacs(callback) {
	$.ajax({
  		url: "data/vendorMacs.json",
  		dataType: "json",
  		success: function(data) {
	 	 	callback(null, data);
  		},
  		error: function(err){
  			callback(err, null);
  		}
	});
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

function onBeforeProbeAdded(mac, ssid, timestamp, fromCSV) {

	if (probeData.macs.hasOwnProperty(mac)) {
		
		flapButterfly(mac, ssid);
		
		if (probeData.macs[mac].knownNetworks.indexOf(ssid) == -1) {

			var butterfly = document.getElementById('_' + mac);
			if (butterfly !== null) {
				updateButterflySize(butterfly, probeData.macs[mac].knownNetworks.length + 1);
			}
		}
	}
}

function onProbeAdded(mac, ssid, timestamp, fromCSV, isNewDevice) {

	var time = moment(parseInt(timestamp)).format('YYYY-MM-DD HH:mm:ss');
	
	if (isNewDevice && !fromCSV && passesFilter(mac)) {
		updatePositions();
		makeButterfly(mac, probeData.macs[mac].knownNetworks);
	}

	// relocate this DOM manipulation stuff eventually
	$('#device-count').html(probeData.numMacs);
	$('#network-count').html(probeData.networks.length);
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
			makeButterfly(macs[i].mac, macs[i].knownNetworks);
		}
		// initPositions(); << can't go here cause it makes the filter menu desapear
		// ...who know's why the fuck that happens >_<
	} else {
		// no results...
	}
}

// resets the global filter var
function clearFilter() {

	filter = {
	    manufacturer: "",
	    networks: [],
	    time: {},
	};
}

// returns an array of macs that pass all filters
function getFilteredMacs() {

	// get an array of filtered mac addresses
	return _.filter(probeData.macs, function(macObj, mac){
		return passesFilter(mac);
	});
}

function passesFilter(mac) {

	if (probeData.macs.hasOwnProperty(mac)) {

		var macObj = probeData.macs[mac];
		
		// filter networks
		if (filter.networks.length > 0 &&
			!_.every(filter.networks, function(network){ return _.contains(macObj.knownNetworks, network) })){
			return false;
		};

		// filter manufacturer
		if (filter.manufacturer != "" &&
			vendorDictionary != undefined && 
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
	}

	return false;
}
