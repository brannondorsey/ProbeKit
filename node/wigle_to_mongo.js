var fs = require('fs');
var _ = require('underscore');
var argv = require('minimist')(process.argv.slice(2));
var MongoClient = require('mongodb').MongoClient;

var inputFile = argv.input || argv.i;

if (!inputFile) {
	console.log('Usage: wigle_to_mongo.js -i <input>');
	process.exit(1);
}

fs.readFile(inputFile, { encoding: 'utf8'}, function(err, data){

	if (err) {
		console.log('[error] Could not load ' + inputFile);
		process.exit(1);
	}
	
	try {
		var json = JSON.parse(data);
		updateDatabase(json);
	} catch (e) {
		console.log('[error] JSON parse failed.');
	}
});


function updateDatabase(json) {

	// Connection URL 
	var url = 'mongodb://localhost:27017/probe';
	// Use connect method to connect to the Server 
	MongoClient.connect(url, function(err, db) {
	  
	if (err) {
		console.log('[error] Cannot connect to MongoDB. Are you sure that there is a MongoDB server running?');
	  	process.exit(1);
	}

	console.log('[verbose] MongoDB connection established.');

	json = _.map(json, function(network) {
	  		
	  	network = _.pick(network, 'ssid', 'netid', 'trilat', 'trilong', 'lastupdt');
	  	network.trilat = parseFloat(network.trilat);
	  	network.trilong = parseFloat(network.trilong);
	  	network.lastupdt = parseInt(network.lastupdt);
	  	return network;
	});

	json = _.filter(json, function(network){
		return network.ssid != "<no ssid>" && ! network.ssid.match(/^\s+$/);
	});

	insertNetworks(json, db, function() {
	  	
	  	db.close();
	  	process.exit(0);

		});
	});
}

function insertNetworks(networks, db, callback) {

	if (! networks instanceof Array) {
  		networks = [networks];
	}

	afterCallback = _.after(networks.length, callback);

  	// Get the documents collection
  	var collection = db.collection('wigle');

  	networks.forEach(function(network, i){
  	
  		var knownNetwork = collection.findOne({
  			ssid: network.ssid,
  			trilat: network.trilat,
  			trilong: network.trilong
  		}, function(err, result){
  			
  			if (err) throw err;
  			if (result) {
  				// console.log('Updating an older network');
	  			// collection.update({ _id: result._id, lastupdt: { "$lt" : network.lastupdt }}, { "$set": { lastupdt : network.lastupdt }}, 
	  			// 	function(err, result){
	  			// 		if (err) throw err;
	  			// 		console.log('update successful');
	  			// 		afterCallback();
	  			// 	});

	  		} else {

	  			// // Insert some documents
		  		collection.insert(network, { w: 1 }, function(err, result){
		  			
		  			if (err) throw err;
		  			console.log(network.ssid);
		  		 	afterCallback();
		  	 	});
	  		}
  		});
  	});
}