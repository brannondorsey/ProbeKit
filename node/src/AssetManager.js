var fs = require('fs');

function AssetManager(callback) {

	var self = this;

	self._dataFolderBaseName = ".probekit"
	self._dataPackNames = [];
	self._mapPackNames  = [];

	// create ~/.probekit folder if it doesn't exist
	fs.exists(getDataPath(), function (exists) {
  		if (!exists) {
  			fs.mkdir(getDataPath(), onDataPathReady);
  		} else {
  			onDataPathReady(null);
  		}
	});

	function onDataPathReady(err) {
		
		var self = this;

		if (err) {
			callback(err);
			return;
		}

		fs.readdir(getDataPath() + '/maps/tiles', function(err, files){

			if (!err) {
				self._mapPackNames = files;
			}
			
			// note this callback runs once
			// 1. ~/.probekit is confirmed to exist
			// 2. self._mapPackNames has been populated
			callback(null);
		});
	}
}

AssetManager.prototype.getDataPath = function() {
	return getUserHome() + '/' + self._dataFolderBaseName;
}

AssetManager.prototype.getInstalledDataPackNames = function() {
	return this._dataPackNames;
}

AssetManager.prototype.getInstalledMapPackNames = function() {
	return this._mapPackNames;
}

function getUserHome() {
  return process.env.HOME || process.env.USERPROFILE;
}

module.exports = AssetManager;
