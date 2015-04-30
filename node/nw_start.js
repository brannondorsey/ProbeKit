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

process.on('uncaughtException', function(err) {
    
    if(err.errno === 'EADDRINUSE') {
        
        console.log('[ server ] Server closing because it received an EADDRINUSE exception.');
        process.exit(1);

    } else {
        console.log(err);
    }
});