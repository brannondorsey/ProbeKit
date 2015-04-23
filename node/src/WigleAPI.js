var MongoClient = require('mongodb').MongoClient;

function WigleAPI(url, callback) {

	var self = this;
	self._connected = false;
	self.db = null;

	MongoClient.connect(url, function(err, db){
		if (!err) self._connected = true;
		self.db = db;
		callback(err, db);
	})
}

// {
// 	collection: "wigleChicago",
// 	ssid: [],
// 	limit: null,
// 	sort: null
// 	}
WigleAPI.prototype.getResults = function(options, callback) {

	var self = this;

	if (options === undefined || callback === undefined || options.ssid === undefined || options.collection === undefined) {
		
		if (callback !== undefined) {
			callback(new Error('Improper option object passed to WigleAPI.getResults()'), { error: "collection parameter not specified" });
		}

		return false;
	}

	if (!self.isConnected()) {
		callback(new Error('Database not connect in WigleAPI'), { error: "MongoDB API server is not connected to a MongoDB session."});
	}

	var collection = self.db.collection(options.collection);

	if (typeof options.ssid == "string") {
		options.ssid = [ options.ssid ];
	} 
	
	var query = {
		"ssid": { "$in": options.ssid }, 
	}

	var metaQuery = 'collection.find(query, { _id: 1, ssid: 1, geo: 1})';

	if (options.limit) {
		metaQuery += '.limit(' + parseInt(options.limit) + ')';
	}

	if (options.sort) {
		metaQuery += '.sort(' + options.sort + ')';
	}

	var data = {};

	eval(metaQuery).toArray(function(err, results){
		
		if (err) {
			data.error = "Internal server error.";
		} else if (results.length < 1) {
			data.error = "No results found."
		} else {
			data.results = results
		}

		callback(err, data);
	});
}

WigleAPI.prototype.isConnected = function() {
	return this._connected;
}

WigleAPI.prototype.handleAPIRequest = function(req, res, next) {
	
	var self = this;

	if (req.query && req.query.ssid && req.query.collection) {
		
		var options = {
			ssid: req.query.ssid,
			collection: req.query.collection
		}

		if (req.query.limit) {
			options.limit = parseInt(req.query.limit);
		}

		if (req.query.sort) {
			options.sort = req.query.sort;
		}

		self.getResults(options, function(err, results){
			if (err) console.log(err);
			res.json(results);
		});

	} else {
		res.json({ error: "Improper API parameters passed to Wigle API." });
	}
}

WigleAPI.prototype.handleHasGeoRequest = function(req, res, next, probeDataStore) {

	var self = this;

	if (req.query && req.query.device && req.query.collection) {
		
		probeDataStore.getNetworks(req.query.device, function(networks){
			
			if (networks == null || networks.length < 1) {
				res.json(false);
			} else {
				
				var collection = self.db.collection(req.query.collection);
				var query = {
					"ssid": {
						"$in": networks
					}
				}

				collection.findOne(query, function(err, results){

					if (err) {
						res.json({ "error": err });
					} else {
						res.json(results != null);
					}
				});
			}
		});

	} else {
		res.json({ "error": "Improper API parameters passed to Wigle API." });
	}
}

module.exports = WigleAPI;
