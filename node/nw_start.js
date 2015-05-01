var launchServer = require('./src/launchServer');

var os = require('os');

// var iface = 'en1'; // osx

// if (os.type() == 'Linux') {
//     iface = 'wlan0';
// }

// check node/server.js for a list of options
var options = {}

launchServer(options);

process.on('uncaughtException', function(err) {
    
    if(err.errno === 'EADDRINUSE') {
        
        console.log('[ server ] Server closing because it received an EADDRINUSE exception.');
        process.exit(1);

    } else {
        console.log('[ server ] Server recieved an uncaughtException:');
        console.log(err);
    }
});