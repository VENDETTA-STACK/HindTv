var mongoose = require("mongoose");

var newSchema = mongoose.Schema({
  EmployeeId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "employees",
    required: true,
  },
  SubCompany:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "subcompanies",
    required: true,
  },
  Company:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "companies",
    required: true,
  },
  Reason:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "masterleavelevels",
    required: true,
  },
  Description: String,
  ApplyDate: Date, 
  StartDate:Date,
  EndDate:Date,
  LeaveType : String,
  LeavePeriod:Number,
  LeaveStatus:String,
});

const admin = mongoose.model("leave", newSchema);
module.exports = admin;
