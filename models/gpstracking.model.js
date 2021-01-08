var mongoose = require("mongoose");

var newSchema = mongoose.Schema({
    EmployeeId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "employees",
        required: true,
      },
      Date:Date,
      Time:String,
      Latitude:Number,
      Longitude:Number,
      Name:String,
});

const admin = mongoose.model("gpstracking", newSchema);
module.exports = admin;
