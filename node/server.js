var argv = require('minimist')(process.argv.slice(2));
var launchServer = require('./src/launchServer');

var options = {
	help: argv.help || argv.h,
	interface: argv.interface || argv.i,
	outputFile: argv.output || argv.o || process.env.HOME + '/.probekit/probes.csv',
	csvOnly: argv['csv-only'] || argv.n,
	liveOnly: argv['live-only'] || argv.l,
	dryRun: argv['dry-run'] || argv.d,
	launchBrowser: argv['launch-browser'] || argv.b,
	dontServe: argv['dont-serve'] || argv.x
}

if (!options.interface || options.help) {
	console.log('Usage: sudo node server --interface=<device> [options]');
	console.log('Options:');
	console.log('    --help, -h                        Get help. Shows this screen. ');
	console.log('    --interface=<device, -i <device>  Interface to capture probe requests with. e.g. -i wlan0');
	console.log('                                      This interface will use be set into monitor mode.');
	console.log('    --output=<file>, -o <file>        Output Probes to CSV file. Using data/probes.csv by default.');
	console.log('    --csv-only, -n                    Use input CSV only, do not use tshark to live capture probes.');
	console.log('    --live-only, -l                   Use live probe capture stream only. Do not load probes from CSV.');
	console.log('    --dry-run, -d                     Do not stream captured probe requests to output file.');
	console.log('    --launch-browser, -b              Open the server\'s url in the system\'s default browser.');
	console.log('    --dont-serve, -x                  Do not launch the server. Used for collecting probe requests only.');
	process.exit(0);
}

if (options.csvOnly && options.liveOnly) {
	console.log('Both --csv-only and --live-only flags are present. These flags are mutually exclusive. Use --help flat to print usage.');
	process.exit(0);
}

launchServer(options);
