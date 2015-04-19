var fs = require("fs");
var util = require("util");
var xml2json = require("xml-to-json");

xml2json({
    input: __dirname + "/../data/vendorMacs.xml"
}, function(err, result){

    if (err) throw err;

    var output = {};
    var mappings = result.MacAddressVendorMappings.VendorMapping;

    for (var key in mappings) {

        var obj = mappings[key]["$"];

        if (!output.hasOwnProperty(obj.mac_prefix)) {
            // console.log(obj.mac_prefix);
            output[obj.mac_prefix] = obj.vendor_name;
        }
    }

    fs.writeFile(__dirname + "/../data/vendorMacs.json", JSON.stringify(output), function(err){
        if (err) throw err;
        console.log(output);
    });
});
