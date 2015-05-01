// this is a mongo shell script to be run as follows
// sed "s/COLLECTION_NAME/$COLLECTION_NAME/" path/to/this/script.js | mongo

use probe

var collectionName = "COLLECTION_NAME";
db[collectionName].ensureIndex({ "ssid": 1 });
db[collectionName].ensureIndex({ "geo": "2d", "ssid": 1 }, { unique: true });