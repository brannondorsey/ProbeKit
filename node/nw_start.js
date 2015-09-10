var serverRunning = false;
var launchServer = null;

// this init hack is a workaround for this bug,
// which runs node-main twice:
// https://github.com/nwjs/nw.js/issues/2981
// https://github.com/nwjs/nw.js/issues/3248
function init() {
    
    if (!serverRunning) {

        launchServer = require('./src/launchServer');

        // check node/server.js for a list of options
        var options = {}

        launchServer(options);
        serverRunning = true;
    }
}

function onClose() {
    console.log('[ nw_start.js ] Window closed event received');
    if (serverRunning) launchServer.onClose();
}


process.on('uncaughtException', function(err) {
    
    if(err.errno === 'EADDRINUSE') {
        
        console.log('[ nw_start.js ] Server closing because it received an EADDRINUSE exception.');
        // process.exit(1);

    } else {
        console.log('[ nw_start.js ] Server recieved an uncaughtException:');
        console.log(err);
    }
});

exports.registerOnClose = function() {

    console.log('[ nw_start.js ] on close event registered');
    var win = window.require('nw.gui').Window.get();
    win.on('close', onClose);
    win.on('closed', onClose);   
}

exports.init = init;