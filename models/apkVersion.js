var mongoose = require("mongoose");

var apkVersionSchema = mongoose.Schema({
  apkVersion: String,
  latestApkUrl: String, 
});

const apkVersionData = mongoose.model("apkVersion", apkVersionSchema);

module.exports = apkVersionData;
