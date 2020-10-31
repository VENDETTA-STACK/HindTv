/*Importing Modules */
var express = require("express");
var router = express.Router();
var employeeSchema = require("../models/employee.model");
var adminSchema = require("../models/admin.model");
const { json } = require("express");
/*Importing Modules */

/* Post request for login
  type = login : Login into mobile application
*/
router.post("/", async function (req, res, next) {
  // if (req.body.type == "login") {
  //   employeeSchema.find({ Mobile: req.body.number }, function (err, record) {
  //     var result = {};
  //     if (err) {
  //       result.Message = "Employee Not Found";
  //       result.Data = [];
  //       result.isSuccess = false;
  //     } else {
  //       if (record.length == 0) {
  //         result.Message = "Employee Not Found";
  //         result.Data = [];
  //         result.isSuccess = false;
  //       } else {
  //         result.Message = "Employee Found";
  //         result.Data = record;
  //         result.isSuccess = true;
  //       }
  //     }
  //     res.json(result);
  //   });
  // }
  if (req.body.type == "login") {
    var memberType;
    var isAdmin =  await adminSchema.find({ mobilenumber : req.body.number});
    if(isAdmin.length == 0){
      memberType = false;
    }else if(isAdmin.length == 1){
      memberType = true;
    }
    var record = await employeeSchema.find({ Mobile: req.body.number });
    var result = {};
    if(record.length == 0){
      result.Message = "Employee Not Found";
      result.Data = [];
      result.isSuccess = false;
    }else{
      result.Message = "Employee Found";
      record = {
            "_id": record[0]._id,
            "FirstName": record[0].FirstName,
            "MiddleName": record[0].MiddleName,
            "LastName": record[0].LastName,
            "Name": record[0].Name,
            "Gender": record[0].Gender,
            "DOB": record[0].DOB,
            "Mobile": record[0].Mobile,
            "Mail": record[0].Mail,
            "JoinDate": record[0].JoinDate,
            "ConfirmationDate": record[0].ConfirmationDate,
            "TerminationDate": record[0].TerminationDate,
            "Prohibition": record[0].Prohibition,
            "Idtype": record[0].Idtype,
            "IDNumber": record[0].IDNumber,
            "Department": record[0].Department,
            "Designation": record[0].Designation,
            "SubCompany": record[0].SubCompany,
            "Timing": record[0].Timing,
            "WifiName": record[0].WifiName,
            "WeekName": record[0].WeekDay,
            "WeekDay": record[0].WeekDay,
            "AccountName": record[0].AccountName,
            "BankName": record[0].BankName,
            "AccountNumber": record[0].AccountNumber,
            "IFSCCode": record[0].IFSCCode,
            "BranchName": record[0].BranchName,
            "MICRCode": record[0].MICRCode,
            "UPICode": record[0].UPICode,
            "ProfileImage": record[0].ProfileImage,
            "CertificateImage": record[0].CertificateImage,
            "EmployeeCode": record[0].EmployeeCode,
            "CompanyId": record[0].CompanyId,
            "__v": record[0].__v,
            "GpsTrack": record[0].GpsTrack,
            "MartialStatus": record[0].MartialStatus,
            "CertificateImage1": record[0].CertificateImage1,
            "CertificateImage2": record[0].CertificateImage2,
            "MemberType":memberType
      }
      result.Data = [record];
      result.isSuccess = true;
    }
    res.json(result);
    
  }
  
});

router.post("/getName/:id" , async function(req,res,next){
  var idName = req.params.id;
  try {
    var record = await employeeSchema.find({ _id : idName });
    // console.log(record[Name]);
    // console.log(myData);
    if(record.length == 1){
      res.status(200).json({ isSuccess : true , Data : [{ Name : record[0].Name}] , Message : "User Name Found" });
    }else{
      res.status(400).json({ isSuccess : true , Data : 0 , Message : "User Name Not Found" });
    }
  } catch (error) {
    res.status(500).json({ isSuccess : false , Message : error.message });
  }
});

module.exports = router;
