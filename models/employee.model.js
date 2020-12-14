var mongoose = require("mongoose");

var newSchema = mongoose.Schema({
  Name: String,
  FirstName: String,
  MiddleName: String,
  LastName: String,
  Gender: String,
  DOB: String,
  MartialStatus: String,
  Mobile: String,
  Mail: String,
  JoinDate: String,
  ConfirmationDate: String,
  TerminationDate: String,
  Prohibition: String,
  Idtype: String,
  IDNumber: String,
  Department: String,
  Designation: String,
  SubCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subcompany",
    required: true,
  },
  Timing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "timing",
    required: true,
  },
  WifiName: String,
  WeekName:String,
  WeekDay:Number,
  ProfileImage:String,
  CertificateImage:String,
  CertificateImage1:String,
  CertificateImage2:String,
  GpsTrack:Boolean,
  AccountName:String,
  BankName:String,
  AccountNumber:Number,
  IFSCCode:String,
  BranchName:String,
  MICRCode:String,
  UPICode:String,
  EmployeeCode:String,
  CompanyId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "company",
    required: true,
  },
  fcmToken: {
    type: String,
  }
});

const admin = mongoose.model("employee", newSchema);

module.exports = admin;
