var argv = require('minimist')(process.argv.slice(2));
var launchServer = require('./src/launchServer');

var os = require('os');
// var interfaces = Object.keys(os.networkInterfaces());

var iface = 'en1'; // osx

if (os.type() == 'Linux') {
    iface = 'wlan0';
}

var options = {
	interface: iface
}

launchServer(options);
