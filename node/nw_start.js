var argv = require('minimist')(process.argv.slice(2));
var launchServer = require('./src/launchServer');

var options = {
	interface: 'en1'
}

launchServer(options);
