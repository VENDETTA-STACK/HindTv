var mongoose = require("mongoose");

var newSchema = mongoose.Schema({
  Quote: String,
  Name: String,
  Status: Boolean,
  apkVersion: String,
  latestApkUrl: String, 
});

const thought = mongoose.model("thought", newSchema);

module.exports = thought;
