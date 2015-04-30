var AssetManager = require(__dirname + '/../src/AssetManager');
var _ = require('underscore');

var assetManager = new AssetManager(function(err){
	
	if (err) throw err;

	console.log('Data path: ' + assetManager.getDataPath());
	console.log('Installed Data Packs: ');
	console.log(assetManager.getInstalledDataPackNames());
	console.log('Installed Map Packs: ');
	console.log(assetManager.getInstalledMapPackNames());
});
