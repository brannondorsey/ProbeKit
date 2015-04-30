var fs = require('fs');

function AssetManager(callback) {

	var self = this;

	self._dataFolderBaseName = ".probekit"
	self._dataPackNames = [];
	self._mapPackNames  = [];

	// create ~/.probekit folder if it doesn't exist
	fs.exists(self.getDataPath(), function (exists) {
  		if (!exists) {
  			fs.mkdir(self.getDataPath(), onDataPathReady);
  		} else {
  			onDataPathReady(null);
  		}
	});

	function onDataPathReady(err) {

		if (err) {
			callback(err);
			return;
		}

		getDirs(self.getDataPath() + '/maps/tiles', function(folders){
			
			self._mapPackNames = folders;

			// note this callback runs once
			// 1. ~/.probekit is confirmed to exist
			// 2. self._mapPackNames has been populated
			callback(null);
		});
	}
}

AssetManager.prototype.getDataPath = function() {
	return getUserHome() + '/' + this._dataFolderBaseName;
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

// from http://stackoverflow.com/questions/18112204/get-all-directories-within-directory-nodejs
function getDirs(rootDir, cb) { 
    
	var dirs = [];

    fs.readdir(rootDir, function(err, files) { 
        
        if (err) throw err; 
        
        for (index = 0; index < files.length; index++) { 
            
            var file = files[index]; 
            
            if (file[0] !== '.') { 
            	
            	foo(index, file, files.length);
            }
        }
    });

    function foo(i, file, numFiles) {

    	var filePath = rootDir + '/' + file; 
            
        fs.stat(filePath, function(err, stat) {
    		
            if (stat.isDirectory()) {  

                dirs.push(file);             
            } 
    
            if (numFiles === (i + 1)) {             
                return cb(dirs); 
            } 
        }); 
    }
}

module.exports = AssetManager;
