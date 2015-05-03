var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var EventEmitter = require('events').EventEmitter;

var emitter = new EventEmitter();

app.use(bodyParser({limit: '3mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.post('/upload', function(req, res, next){
	
    res.send('[ server ] File upload received');

	console.log('[ server ] File upload received');

    var csv = decodeURIComponent(req.body.data);
    
    if (csv) {

        var counter = 0;
        var lines = csv.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var probe = lines[i].split(',');
            if (probe.length == 3) {
                
                var probe = {
                    mac: probe[0],
                    ssid: probe[1],
                    timestamp: probe[2]
                }

                emitter.emit('probeReceived', probe);
                counter++;
            }
        }

        console.log('[ server ] ' + counter + ' probes added');
    }
});

	
io.on('connection', function (socket) {

    emitter.addListener('probeReceived', function(probe){
        socket.emit('probeReceived', probe);
    });
});

server.listen(4444, function () {

  	var host = 'localhost';
  	var port = server.address().port

  	console.log('[ server ] Server listening at http://%s:%s', host, port)
});
		
	

