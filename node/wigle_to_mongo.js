var fs = require('fs');
var _ = require('underscore');
var argv = require('minimist')(process.argv.slice(2));
var MongoClient = require('mongodb').MongoClient;

var inputFile = argv.input || argv.i;
var collectionName = argv.collection || argv.c;

var oldDBCount = null;

if (!inputFile || !collectionName) {
	console.log('Usage: wigle_to_mongo.js -i <input> -c <collection>');
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

		db.collections(function(err, collections){

			if (err) {
				console.log('[error] Could not fetch database collection names.');
				db.close();
  				process.exit(1);
			}

			var nameFound = false;
			collections.forEach(function(collection, i){
				if (collection.s && collection.s.name && collection.s.name == collectionName) {
					nameFound = true;
				}
			});

			if (!nameFound) {
				console.log('[error] Collection \'' + collectionName + '\' does not exist.');
				db.close();
  				process.exit(1);
			}

			json = _.map(json, function(network) {	
				return {
					ssid: network.ssid,
					netid: network.netid,
					geo: {
				  		lat: parseFloat(network.trilat),
				  		lon: parseFloat(network.trilong)
				  	},
				  	lastupdt: network.lastupdt
				}
			});

			json = _.filter(json, function(network){
				return network.ssid != "<no ssid>" && ! network.ssid.match(/^\s+$/);
			});

			console.log('[verbose] Proposing ' + json.length + ' networks to be added to database.');

			insertNetworks(json, db, function() {

				var collection = db.collection(collectionName);
				collection.count(function(err, count){

					if (oldDBCount && count) {
						console.log('[verbose] ' + (count - oldDBCount) + ' networks added to database.');
					}

					db.close();
			  		process.exit(0);
				});
			});
		});
	});
}

function insertNetworks(networks, db, callback) {

	if (! networks instanceof Array) {
  		networks = [ networks ];
	}

	afterCallback = _.after(networks.length, callback);

  	// Get the documents collection
  	var collection = db.collection(collectionName);

	collection.count(function(err, count){

		console.log('[verbose] ' + count + ' networks already in database.');
		oldDBCount = count;

		networks.forEach(function(network, i){
  				   	
	  		collection.insert(network, { w: 1 }, function(err, result){
				
	 			// if (err) throw err;
	 			if (result && result.result.ok == 1) {
	 				console.log(network.ssid);
	 		 	}

	 		 	afterCallback();
	 	 	});
		  	// 	} else {
		  	// 		afterCallback();
		  	// 	}
	  		// var knownNetwork = collection.findOne({
	  		// 	ssid: network.ssid,
	  		// 	trilat: network.trilat,
	  		// 	trilong: network.trilong
	  		// }, function(err, result){
	  			
	  		// 	if (err) throw err;
	  		// 	if (!result) {

		  	// 		// // Insert some documents
			  // 		collection.insert(network, { w: 1 }, function(err, result){
			  			
			  // 			if (err) throw err;
			  // 			console.log(network.ssid);
			  // 		 	afterCallback();
			  // 	 	});
		  	// 	} else {
		  	// 		afterCallback();
		  	// 	}
	  		// });
	  		
	  	});
	});
}