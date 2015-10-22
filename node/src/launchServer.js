var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var moment = require('moment');
var ProbeCapture = require('./ProbeCapture');
var ProcessLauncher = require('./ProcessLauncher');
var WigleAPI = require('./WigleAPI');
var ProbeDataStore = require('./ProbeDataStore');
var AssetManager = require('./AssetManager');

var procLauncher = undefined;
var probeCapture = undefined;

function launchServer(options) {

	var help = options.help;
	var outputFile = options.outputFile;
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

	var writeStream = undefined;
	var assetManager = undefined;

	var probeDataStore = new ProbeDataStore();

	// wait half a second before connecting to mongodb on the off chance that
	// mongodb is not running and has to be created by the processLauncher.
	// this is pretty bad practice and we should probably be using something
	// like waitpid(2)
	setTimeout(function(){

		var wigleAPI = new WigleAPI('mongodb://localhost:27017/probe', function(err, db){
		
			// note any /api requests will fail until this callback is run
			if (err) {
				console.log('[ server ] Error connecting to MongoDB: ' + err);
			} else {
				console.log('[ server ] MongoDB connection established.');
			}

			app.use('/api/wigle/hasgeo', function(req, res, next){ wigleAPI.handleHasGeoRequest(req, res, next, probeDataStore) });
			app.use('/api/wigle', function(req, res, next){ wigleAPI.handleAPIRequest(req, res, next) });

		});

	}, 500);

	var assetManager = new AssetManager(function(err){

		if (err) {
			console.log('[ server ] AssetManager could not find ' + assetManager.getDataPath());
		}

		fs.readFile(assetManager.getDataPath() + '/settings.json', { encoding: 'utf8' }, onSettingsFileLoaded);
		
	});

	function onSettingsFileLoaded(err, data) {
		
		var settings = {};

		if (err) {
			console.log('[ server ] Error loading ~/.probekit/settings.json');
		} else {

			try {
				settings = JSON.parse(data);
			} catch(e) {
				console.log('[ server ] Error parsing ~/.probekit/settings.json');
			}
		}

		var iface = options.interface || settings.wifiInterface;

		probeCapture = new ProbeCapture(iface);	

		if (!outputFile) {
			 outputFile = assetManager.getDataPath() + '/probes.csv';
		}

		if (!liveOnly) {

			probeDataStore.loadFromCSV(outputFile, function(err){

				// note that any query made to probeDataStore before
				// this callback returns will not have access to the
				// CSV data
				
				if (err) {
					console.log('[ server ] Error loading probe CSV file');
				}
			});
		}

		if (!csvOnly) {
			
			procLauncher = new ProcessLauncher(iface, true, settings);
			process.on('SIGINT', function(code){ onClose(); });
			process.on('SIGTERM', function(code){ onClose(); });
		}

		if (!dryRun) {
			writeStream = fs.createWriteStream(outputFile, { flags: 'a', encoding: 'utf8' });
		}

		// register event first
		if (probeCapture) {
			
			probeCapture.on('probeReceived', function(packet){

				if (writeStream) {
					var csvLine = packet.mac + ',' + packet.ssid + ',' + packet.timestamp + '\n'
					writeStream.write(csvLine);
				}

				probeDataStore.addPacket(packet);

				console.log(moment(packet.timestamp).format('YYYY-MM-DD HH:mm:ss') + '    MAC: ' + packet.mac + '    SSID: ' + packet.ssid);
			});
		}

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

		app.use('/api/maps', function(req, res, next){ 
			res.send(assetManager.getInstalledMapPackNames());
		});

		app.use('/api/map', function(req, res, next){ 
			res.send(settings.map || '');
		});

		app.use('/data', express.static(path.resolve(assetManager.getDataPath())));
		app.use('/data', express.static(path.resolve(__dirname + '/../../data')));
		app.use(express.static(path.resolve(__dirname + '/../../public')));

		io.on('connection', function (socket) {

			if (probeCapture) {
				 
				 probeCapture.on('probeReceived', function(probe){
		    	
		    		// don't send if csvOnly because client loads
		    		// csv file from AJAX
		    		if (!csvOnly) {
		    			socket.emit('probeReceived', probe);
		    		}
		    	});
			}

		    // right now this method is only being used by the 
			// installation
			probeDataStore.on('newDevice', function(probe){
				socket.emit('newDeviceReceived', probe.mac);
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
}

function onClose() {
	console.log('[ server ] Application close event fired');
	if (procLauncher) procLauncher.close(); 
	if (probeCapture) probeCapture.close();
	process.exit(0);
}

module.exports = launchServer;
module.exports.onClose = onClose;