var mongoose = require("mongoose");

var apkVersionSchema = mongoose.Schema({
  androidVersion: String,
  iosVersion: String,
  latestApkUrl: String, 
});

const apkVersionData = mongoose.model("apkVersion", apkVersionSchema);

module.exports = apkVersionData;
