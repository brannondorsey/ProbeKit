//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 
//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 
// Brannon's sockets magix ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 
//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 
//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 

var probeData = {
	numMacs: 0,
	macs: {}
};

var rawCSV = undefined;
	
$.ajax({
  	url: "data/probes.csv",
  	success: function(data) {
	  rawCSV = data;
	  parseCSVToProbeData();
	  // console.log( probeData.macs )
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
		flapButterfly('_'+mac);
	} else {
		updatePositions();
		makeButterfly(mac);					
	}
}

function onProbeAdded(mac, ssid, timestamp, fromCSV) {
	var time = moment(parseInt(timestamp)).format('YYYY-MM-DD HH:mm:ss');
	//$('#dump').prepend(time + '    MAC: ' + mac + '    SSID: ' + ssid + '\n');
}
