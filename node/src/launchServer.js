var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var moment = require('moment');
var TsharkProbeParser = require('./TsharkProbeParser');
var TsharkProcessLauncher = require('./TsharkProcessLauncher');
var WigleAPI = require('./WigleAPI');
var ProbeDataStore = require('./ProbeDataStore');

function launchServer(options) {

	var help = options.help;
	var iface = options.interface;
	var outputFile = options.outputFile || __dirname + '/../../data/probes.csv';;
	var csvOnly = options.csvOnly;
	var liveOnly = options.liveOnly;
	var dryRun = options.liveDryRun;
	var launchBrowser = options.launchBrowser;
	var dontServe = options.dontServe;

	// var rootCheckProc = spawnSync('id', ['-u'], { encoding: 'utf8' });
	// if (rootCheckProc.output[1] != '0\n') {
	// 	console.log('This script must be run as root.');
	// 	console.log('    sudo node server.js --interface=<device> [options]');
	// 	process.exit(0);
	// }

	var procLauncher = undefined;
	var tsharkProcess = undefined;
	var channelHopProcess = undefined;
	var writeStream = undefined;

	var probeParser = new TsharkProbeParser();
	var wigleAPI = new WigleAPI('mongodb://localhost:27017/probe', function(err, db){
		
		// note any /api requests will fail until this callback is run
		if (err) {
			console.log('[ server ] Error connecting to MongoDB: ' + err);
		} else {
			console.log('[ server ] MongoDB connection established.');
		}
	});

	var probeDataStore = new ProbeDataStore();

	if (!liveOnly) {

		probeDataStore.loadFromCSV(outputFile, function(err){

			// note that any query made to probeDataStore before
			// this callback returns will not have access to the
			// CSV data
			
			if (err) {
				console.log('[ server ] error loading probe CSV file');
			}
		});
	}

	if (!csvOnly) {
		procLauncher = new TsharkProcessLauncher(iface, true);
		tsharkProcess = procLauncher.tsharkProcess;
		channelHopProcess = procLauncher.channelHopProcess;
	}

	if (!dryRun) {
		writeStream = fs.createWriteStream(outputFile, { flags: 'a', encoding: 'utf8' });
	}

	if (tsharkProcess) {

		tsharkProcess.stdout.on('data', function (data) {

			var lines = data.toString('utf8').split('\n');

			for (var i = 0; i < lines.length; i++) {
				// this will fire the probeParser.on('probeReceived') event
				// if the packet is parsed successfully
				probeParser.parseLine(lines[i]);
			}
		});

		tsharkProcess.stderr.on('data', function (data) {

			var buff = data.toString('utf8');

			// tshark v1.10.6 emits stderr integers at regular intervals. Ignore them.
			if (!buff.match(/\d/)) {
				console.log('Tshark stderr: ' + buff);
			}
		});

		tsharkProcess.on('close', function (code) {
		  	console.log('tshark process exited with code ' + code);
		  	if (writeStream) {
		  		writeStream.close();
		  	}
		});
	}

	// register event first
	probeParser.on('probeReceived', function(packet){

		if (writeStream) {
			var csvLine = packet.mac + ',' + packet.ssid + ',' + packet.timestamp + '\n'
			writeStream.write(csvLine);
		}

		probeDataStore.addPacket(packet);

		console.log(moment(packet.timestamp).format('YYYY-MM-DD HH:mm:ss') + '    MAC: ' + packet.mac + '    SSID: ' + packet.ssid);
	});

	if (liveOnly) {
		app.get('/data/probes.csv', function(req, res){
			res.sendFile(path.resolve(__dirname + '/../../data/empty.csv'));
		});
	}

	app.use('/api/devices', function(req, res, next){ 
		probeDataStore.getDevicesAsArray(function(devices){
			res.json(devices);
		});
	});

	app.use('/api/networks', function(req, res, next){
		
		if (req.query && req.query.device) {

			probeDataStore.getNetworks(req.query.device, function(networks) {
				
				var result = networks || { "error": "device not found." };
				res.json(result);
			});

		} else {

			probeDataStore.getAllNetworks(function(networks) {
				res.json(networks);
			});
		}
	});

	app.use('/api/wigle/hasgeo', function(req, res, next){ wigleAPI.handleHasGeoRequest(req, res, next, probeDataStore) });
	app.use('/api/wigle', function(req, res, next){ wigleAPI.handleAPIRequest(req, res, next) });
	app.use('/data', express.static(path.resolve(__dirname + '/../../data')));
	app.use(express.static(path.resolve(__dirname + '/../../public')));

	io.on('connection', function (socket) {

	    probeParser.on('probeReceived', function(probe){
	    	
	    	// don't send if csvOnly because client loads
	    	// csv file from AJAX
	    	if (!csvOnly) {
	    		socket.emit('probeReceived', probe);
	    	}
	    	
	    	// right now this method is only being used by the 
	    	// installation
	    	probeDataStore.isNewDevice(probe.mac, function(isNew){
	    		
	    		if (isNew) {
	    			socket.emit('newDeviceReceived', probe.mac);
	    		}
	    	});
	    });
	});

	if (!dontServe) {

		server.listen(3000, function () {

		  var host = 'localhost';
		  var port = server.address().port

		  console.log('[ server ] Server listening at http://%s:%s', host, port)

		  if (launchBrowser) {

				var proc = spawnSync('which', ['firefox'], { encoding: 'utf8' });
				if (proc.status == 0) {

				var url = 'http://localhost:' + port;
			  	console.log('[ server ] Launching default system browser to url: ' + url)
			  	var browserProc = spawn('firefox', ['--new-window', url]);
			  	browserProc.stderr.pipe(process.stderr);

				} else {
					console.log('[ server ] Warning: Could not launch browser window as firefox is not installed');
				}
		  }

		});
	}
}

module.exports = launchServer;