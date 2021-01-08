var mongoose = require("mongoose");

var gpsTrackingSchema = mongoose.Schema({
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

const admin = mongoose.model("GpsTrack", gpsTrackingSchema);
module.exports = admin;
