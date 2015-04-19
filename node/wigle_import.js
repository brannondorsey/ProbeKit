var fs = require('fs');
var path = require('path');
var spawnSync = require('child_process').spawnSync;
var argv = require('minimist')(process.argv.slice(2));
var MongoClient = require('mongodb').MongoClient;

var inputFile = argv.input || argv.i;
var databaseName = argv.db || argv.d || 'probe';
var collectionName = argv.collection || argv.c;

if (!inputFile) {
	console.log('Usage: wigle_import.js -i <input> -d [database] -c [collection]');
	process.exit(1);
}

var url = 'mongodb://localhost:27017/' + databaseName;
MongoClient.connect(url, function(err, db) {
  
	if (err) {
		console.log('[error] Cannot connect to MongoDB "' + databaseName + '" database. Are you sure that there is a MongoDB server running?');
	  	process.exit(1);
	} else {
		console.log('[verbose] Connected to "' + databaseName + '" database');
	}

	if (!collectionName) {
		collectionName = path.basename(inputFile, path.extname(inputFile));
	}

	var collection = db.collection(collectionName);

	// create indexes
	collection.ensureIndex({ "ssid": 1 }, function(err){
		if (err) die('[error] Index "{ ssid: 1 }" could not be created for collection ' + collectionName, 1, db);
		collection.ensureIndex({ "geo": "2d", "ssid": 1 }, { unique: true }, function(err){
			if (err) die('[error] Index "{ geo: "2d", ssid: 1 }, { unique: true }" could not be created for collection ' + collectionName, 1, db);
			// import collection
			importCollectionSync();
			db.close();
		});
	});
});

function importCollectionSync() {

	// check for mongoimport
	var proc = spawnSync('which', ['mongoimport'], { encoding: 'utf8' });
	if (proc.status != 0) {
		die('[error] mongoimport command not found.', 1);
	}

	console.log('[verbose] mongoimport subprocess launched... this could take a second.');
	proc = spawnSync('mongoimport',  ['--db', databaseName, '--collection', collectionName, '--file', inputFile], { encoding: 'utf8' });
	if (proc.status != 0) {
		console.log(proc.stderr);
		console.log('[error] import failed.');
		process.exit(1);
	} else {
		console.log(proc.stderr);
		console.log('[verbose] import finished.');
	}
}

function die(message, code, db) {
	console.log(message);
	if (db) db.close();
	process.exit(code);
}
