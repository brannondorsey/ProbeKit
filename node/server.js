var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var argv = require('minimist')(process.argv.slice(2));
var moment = require('moment');
var TsharkProbeParser = require('./src/TsharkProbeParser');
var TsharkProcessLauncher = require('./src/TsharkProcessLauncher');

var help = argv.help || argv.h;
var iface = argv.interface || argv.i;
var outputFile = argv.output || argv.o || __dirname + '/../data/probes.csv';
var csvOnly = argv['csv-only'] || argv.n;
var liveOnly = argv['live-only'] || argv.l;
var dryRun = argv['dry-run'] || argv.d;
var launchBrowser = argv['launch-browser'] || argv.b;
var dontServe = argv['dont-serve'] || argv.x;

if (!iface || help) {
	console.log('Usage: sudo node server --interface=<device> [options]');
	console.log('Options:');
	console.log('    --help, -h                        Get help. Shows this screen. ');
	console.log('    --interface=<device, -i <device>  Interface to capture probe requests with. e.g. -i wlan0');
	console.log('                                      This interface will use be set into monitor mode.');
	console.log('    --output=<file>, -o <file>        Output Probes to CSV file. Using data/probes.csv by default.');
	console.log('    --csv-only, -n                    Use input CSV only, do not use tshark to live capture probes.');
	console.log('    --live-only, -l                   Use tshark probe stream only. Do not load probes from CSV.');
	console.log('    --dry-run, -d                     Do not stream captured probe requests to output file.');
	console.log('    --launch-browser, -b              Open the server\'s url in the system\'s default browser.');
	console.log('    --dont-serve, -x                  Do not launch the server. Used for collecting probe requests only.');
	process.exit(0);
}

if (csvOnly && liveOnly) {
	console.log('Both --csv-only and --live-only flags are present. These flags are mutually exclusive. Use --help flat to print usage.');
	process.exit(0);
}

var rootCheckProc = spawnSync('id', ['-u'], { encoding: 'utf8' });
if (rootCheckProc.output[1] != '0\n') {
	console.log('This script must be run as root.');
	console.log('    sudo node server.js --interface=<device> [options]');
	process.exit(0);
}

var procLauncher = undefined;
var tsharkProcess = undefined;
var channelHopProcess = undefined;
var writeStream = undefined;

var probeParser = new TsharkProbeParser();

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

	console.log(moment(packet.timestamp).format('YYYY-MM-DD HH:mm:ss') + '    MAC: ' + packet.mac + '    SSID: ' + packet.ssid);
});

if (liveOnly) {
	app.get('/data/probes.csv', function(req, res){
		res.sendFile(path.resolve(__dirname + '/../data/empty.csv'));
	});
}

app.use('/data', express.static(path.resolve(__dirname + '/../data')));
app.use(express.static(path.resolve(__dirname + '/../public')));

io.on('connection', function (socket) {
    probeParser.on('probeReceived', function(probe){
    	if (!csvOnly) {
    		socket.emit('probeReceived', probe);
    	}
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
