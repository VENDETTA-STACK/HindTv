var mongoose = require("mongoose");

var newSchema = mongoose.Schema({
  MasterName:{
    type:String,
    required:true,
  },
  MasterType:{
    type:String,
    required:true,
  },
  Status:{
    type:Boolean,
    required:true,
    default:false,
  }
});

const admin = mongoose.model("masterLeaveLevel", newSchema);
module.exports = admin;
