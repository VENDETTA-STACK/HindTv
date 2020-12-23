/*Importing Modules */
var express = require("express");
var router = express.Router();
var employeeSchema = require("../models/employee.model");
var subcompanySchema = require("../models/subcompany.models");
var adminSchema = require("../models/admin.model");
var timingSchema = require("../models/timing.models");
var companySchema = require("../models/company.models");
var attendanceSchema = require("../models/attendance.models");
var memoSchema = require("../models/memo.model");
var leaveSchema = require("../models/leave.model");
var STRING = require('string');
const multer = require("multer");
var mongoose = require("mongoose");
const { json } = require("express");
const cron = require('node-cron');
const request = require('request')
/*Importing Modules */

/*Post request for employee
  There are different type use for various activities
  type = insert : Insert a new employee,
  type = update : Update an individual employee
  type = getdata : Returns data of all employee
  type = gettiming : Returns data of all timing store for employee
  type = getsingledata : For editing fetches a single data of an user
  type = getsubcompanyemployee : Need to be shifted from it's call

  function checkpermission() : It checks whether you have a correct token to access data and also checks whether you have the rights to Add,View,Update the data.
*/

var attendImg = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".")[1]
    );
  },
});

var upload = multer({ storage: attendImg });

function dateformate(date){
  date = date.split("-");
  date = date[2]+"/"+date[1]+"/"+date[0];
  console.log(date);
  return date;
}

router.post("/", upload.fields([{ name:"employeeimage"}, {name:"employeedocument"},{name:"employeedocument2"},{name:"employeedocument3"}]), async function (req, res, next) {
  if (req.body.type == "insert") {
    console.log(req.body);
    var permission = await checkpermission(req.body.type, req.body.token);

    //auto generate employeecode
    var subcompanyID = await subcompanySchema.findById(req.body.subcompany);
    var companyID = await companySchema.findById(subcompanyID.CompanyId);
    var companyname = companyID.Name;
    companyname = companyname.replace(/\s/gi, "").toUpperCase();
    var subcompanyname = subcompanyID.Name;
    subcompanyname = subcompanyname.replace(/\s/gi, "").toUpperCase();
    var employeename = req.body.firstname;
    employeename = employeename.toUpperCase();
    var employeecode = companyname.substr(0,3) +subcompanyname.substr(0,3)+ employeename.substr(0,3) + req.body.mobile.substr(0,3);
    
    if (permission.isSuccess == true) {
      var image,document;
      if(req.files.employeeimage == undefined || req.files.employeedocument == undefined){
        var record = new employeeSchema({
          FirstName: req.body.firstname,
          MiddleName: req.body.middlename,
          LastName: req.body.lastname,
          Name:
            req.body.firstname +
            " " +
            req.body.middlename +
            " " +
            req.body.lastname,
          Gender: req.body.gender,
          DOB: req.body.dob,
          MartialStatus: req.body.married,
          Mobile: req.body.mobile,
          Mail: req.body.mail,
          JoinDate: req.body.joindate,
          ConfirmationDate: req.body.confirmationdate,
          TerminationDate: req.body.terminationdate,
          Prohibition: req.body.prohibition,
          Idtype: req.body.idtype,
          IDNumber: req.body.idnumber,
          Department: req.body.department,
          Designation: req.body.designation,
          SubCompany: req.body.subcompany,
          Timing: req.body.timing,
          WifiName: req.body.wifiname,
          WeekName: req.body.weekdayname,
          WeekDay: req.body.numofday,
          GpsTrack: req.body.gpstrack,
          AccountName:req.body.accountname,
          BankName:req.body.bankname,
          AccountNumber:req.body.accountnumber,
          IFSCCode:req.body.ifsccode,
          BranchName:req.body.branchname,
          MICRCode:req.body.micrcode,
          UPICode:req.body.upicode,
          EmployeeCode:employeecode,
          CompanyId:companyID.id,
        });

        record.save({}, function (err, record) {
          var result = {};
          if (err) {
            result.Message = "Record Not Inserted";
            result.Data = err;
            result.isSuccess = false;
          } else {
            if (record.length == 0) {
              result.Message = "Record Not Inserted";
              result.Data = [];
              result.isSuccess = false;
            } else {
              result.Message = "Record Inserted";
              result.Data = record;
              result.isSuccess = true;
            }
          }
          res.json(result);
        });
      }
      else if(req.files.employeeimage != undefined && req.files.employeedocument != undefined && req.files.employeedocument2 != undefined){
        image =req.files.employeeimage[0].filename;
        document = req.files.employeedocument[0].filename;
        document1 = req.files.employeedocument2[0].filename;

        var record = new employeeSchema({
          FirstName: req.body.firstname,
          MiddleName: req.body.middlename,
          LastName: req.body.lastname,
          Name:
            req.body.firstname +
            " " +
            req.body.middlename +
            " " +
            req.body.lastname,
          Gender: req.body.gender,
          DOB:req.body.dob,
          MartialStatus: req.body.married,
          Mobile: req.body.mobile,
          Mail: req.body.mail,
          JoinDate: req.body.joindate,
          ConfirmationDate: req.body.confirmationdate,
          TerminationDate: req.body.terminationdate,
          Prohibition: req.body.prohibition,
          Idtype: req.body.idtype,
          IDNumber: req.body.idnumber,
          Department: req.body.department,
          Designation: req.body.designation,
          SubCompany: req.body.subcompany,
          Timing: req.body.timing,
          WifiName: req.body.wifiname,
          WeekName: req.body.weekdayname,
          WeekDay: req.body.numofday,
          GpsTrack: req.body.gpstrack,
          AccountName:req.body.accountname,
          BankName:req.body.bankname,
          AccountNumber:req.body.accountnumber,
          IFSCCode:req.body.ifsccode,
          BranchName:req.body.branchname,
          MICRCode:req.body.micrcode,
          UPICode:req.body.upicode,
          ProfileImage: image,
          CertificateImage: document,
          CertificateImage1: document1,
          EmployeeCode:employeecode,
          CompanyId:companyID.id,
        });

        record.save({}, function (err, record) {
          var result = {};
          if (err) {
            result.Message = "Record Not Inserted";
            result.Data = err;
            result.isSuccess = false;
          } else {
            if (record.length == 0) {
              result.Message = "Record Not Inserted";
              result.Data = [];
              result.isSuccess = false;
            } else {
              result.Message = "Record Inserted";
              result.Data = record;
              result.isSuccess = true;
            }
          }
          res.json(result);
        });
      }
      else if(req.files.employeeimage != undefined && req.files.employeedocument != undefined && req.files.employeedocument2 != undefined && req.files.employeedocument3 != undefined ){
        image =req.files.employeeimage[0].filename;
        document = req.files.employeedocument[0].filename;
        document1 = req.files.employeedocument2[0].filename;
        document2 = req.files.employeedocument3[0].filename;

        var record = new employeeSchema({
          FirstName: req.body.firstname,
          MiddleName: req.body.middlename,
          LastName: req.body.lastname,
          Name:
            req.body.firstname +
            " " +
            req.body.middlename +
            " " +
            req.body.lastname,
          Gender: req.body.gender,
          DOB: req.body.dob,
          MartialStatus: req.body.married,
          Mobile: req.body.mobile,
          Mail: req.body.mail,
          JoinDate: req.body.joindate,
          ConfirmationDate: req.body.confirmationdate,
          TerminationDate: req.body.terminationdate,
          Prohibition: req.body.prohibition,
          Idtype: req.body.idtype,
          IDNumber: req.body.idnumber,
          Department: req.body.department,
          Designation: req.body.designation,
          SubCompany: req.body.subcompany,
          Timing: req.body.timing,
          WifiName: req.body.wifiname,
          WeekName: req.body.weekdayname,
          WeekDay: req.body.numofday,
          GpsTrack: req.body.gpstrack,
          AccountName:req.body.accountname,
          BankName:req.body.bankname,
          AccountNumber:req.body.accountnumber,
          IFSCCode:req.body.ifsccode,
          BranchName:req.body.branchname,
          MICRCode:req.body.micrcode,
          UPICode:req.body.upicode,
          ProfileImage: image,
          CertificateImage: document,
          CertificateImage1: document1,
          CertificateImage2: document2,
          EmployeeCode:employeecode,
          CompanyId:companyID.id,
        });

        record.save({}, function (err, record) {
          var result = {};
          if (err) {
            result.Message = "Record Not Inserted";
            result.Data = err;
            result.isSuccess = false;
          } else {
            if (record.length == 0) {
              result.Message = "Record Not Inserted";
              result.Data = [];
              result.isSuccess = false;
            } else {
              result.Message = "Record Inserted";
              result.Data = record;
              result.isSuccess = true;
            }
          }
          res.json(result);
        });
      }
    } else {
      res.json(permission);
    }
  } else if (req.body.type == "getdata") {
    var permission = await checkpermission(req.body.type, req.body.token);
    if (permission.isSuccess == true) {
      var companyselection = await adminSchema.findById(req.body.token);
      if (companyselection.allaccessubcompany == true) {
        console.log(companyselection.allaccessubcompany);
        var record = await employeeSchema.find({}).populate("SubCompany");
        var result = {};
        if (record.length == 0) {
          result.Message = "Employee Not Found";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "Employee Found";
          result.Data = record;
          result.isSuccess = true;
        }
        res.json(result);
      } else {
        var record = await employeeSchema
          .find({ SubCompany: companyselection.accessCompany })
          .populate("SubCompany");
        var result = {};
        if (record.length == 0) {
          result.Message = "Employee Not Found";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "Employee Found";
          result.Data = record;
          result.isSuccess = true;
        }
        res.json(result);
      }
    } else {
      res.json(permission);
    }
  } else if (req.body.type == "getsingledata") {
    var permission = await checkpermission(req.body.type, req.body.token);
    if (permission.isSuccess == true) {
       
        var record = await employeeSchema
        .findById(req.body.id,(err,record)=>{
          var result = {};
          if (record.length == 0) {
            result.Message = "Employee Not Found";
            result.Data = [];
            result.isSuccess = false;
          } else {
            result.Message = "Employee Found";
            result.Data = record;
            result.isSuccess = true;
          }
          res.json(result);
        });
        
    } else {
      res.json(permission);
    }

  } else if (req.body.type == "getsubcompanyemployee") {
    if(req.body.SubCompany == 0 || req.body.SubCompany == undefined ){
      var companyselection = await adminSchema.findById(req.body.token);
      if (companyselection.allaccessubcompany == true) {
          var record = await employeeSchema.find();
          var result = {};
          if (record.length == 0) {
            result.Message = "Employee Not Found";
            result.Data = [];
            result.isSuccess = false;
          } else {
            result.Message = "Employee Found";
            result.Data = record;
            result.isSuccess = true;
          }
          res.json(result);
      } else if(companyselection.allaccessubcompany == false){
        var record = await employeeSchema.find();
          var result = {};
          if (record.length == 0) {
            result.Message = "Employee Not Found";
            result.Data = [];
            result.isSuccess = false;
          } else {
            result.Message = "Employee Found";
            result.Data = record;
            result.isSuccess = true;
          }
          res.json(result);
      }
       else {
        var record = await employeeSchema.find({SubCompany: companyselection.accessCompany});
          var result = {};
          if (record.length == 0) {
            result.Message = "Employee Not Found";
            result.Data = [];
            result.isSuccess = false;
          } else {
            result.Message = "Employee Found";
            result.Data = record;
            result.isSuccess = true;
          }
          res.json(result);
      }
    } else{
      employeeSchema.find({ SubCompany: req.body.SubCompany }, (err, record) => {
        var result = {};
        if (err) {
          result.Message = "Employee Not Found";
          result.Data = err;
          result.isSuccess = false;
        } else {
          if (record.length == 0) {
            result.Message = "Employee Not Found";
            result.Data = [];
            result.isSuccess = false;
          } else {
            result.Message = "Employee Found";
            result.Data = record;
            result.isSuccess = true;
          }
        }
        res.json(result);
      });
    }
    
  } else if (req.body.type == "getemployee") {
    var permission = await checkpermission(req.body.type, req.body.token);
    if (permission.isSuccess == true) {
      var record = await employeeSchema.find({_id:req.body.id}).populate({ path:"SubCompany",
      select:"Name"});
      var result = {};
      if (record !== null && record.length == 0) {
        result.Message = "Employee Not Found";
        result.Data = [];
        result.isSuccess = false;
      } else {
        result.Message = "Employee Found";
        result.Data = record;
        result.isSuccess = true;
      }
      res.json(result);
    } else {
      res.json(permission);
    }
  } else if (req.body.type == "update") {
    var permission = await checkpermission(req.body.type, req.body.token);
    if (permission.isSuccess == true) {
      //if(req.files.employeeimage == undefined && req.files.employeedocument == undefined && req.files.employeedocument2 != undefined && req.files.employeedocument3 != undefined){
      if(req.files.employeeimage == undefined && req.files.employeedocument == undefined && req.files.employeedocument2 == undefined && req.files.employeedocument3 == undefined ){  
        employeeSchema.findByIdAndUpdate(
          req.body.id,
          {
            FirstName: req.body.firstname,
            MiddleName: req.body.middlename,
            LastName: req.body.lastname,
            Name:
              req.body.firstname +
              " " +
              req.body.middlename +
              " " +
              req.body.lastname,
            Gender: req.body.gender,
            DOB: req.body.dob,
            MartialStatus: req.body.married,
            Mobile: req.body.mobile,
            Mail: req.body.mail,
            JoinDate: req.body.joindate,
            ConfirmationDate: req.body.confirmationdate,
            TerminationDate: req.body.terminationdate,
            Prohibition: req.body.prohibition,
            Idtype: req.body.idtype,
            IDNumber: req.body.idnumber,
            Department: req.body.department,
            Designation: req.body.designation,
            SubCompany: req.body.subcompany,
            Timing: req.body.timing,
            WifiName: req.body.wifiname,
            WeekName: req.body.weekdayname,
            WeekDay: req.body.numofday,
            GpsTrack: req.body.gpstrack,
            AccountName:req.body.accountname,
            BankName:req.body.bankname,
            AccountNumber:req.body.accountnumber,
            IFSCCode:req.body.ifsccode,
            BranchName:req.body.branchname,
            MICRCode:req.body.micrcode,
            UPICode:req.body.upicode
          },
          (err, record) => {
            var result = {};
            if (err) {
              result.Message = "Employee Not Updated";
              result.Data = err;
              result.isSuccess = false;
            } else {
              if (record.length == 0) {
                result.Message = "Employee Not Updated";
                result.Data = [];
                result.isSuccess = false;
              } else {
                result.Message = "Employee Updated";
                result.Data = record;
                result.isSuccess = true;
              }
            }
            res.json(result);
          }
        );
      }

      else if(req.files.employeeimage != undefined && req.files.employeedocument != undefined && req.files.employeedocument2 != undefined && req.files.employeedocument3 == undefined){
        employeeSchema.findByIdAndUpdate(
          req.body.id,
          {
            FirstName: req.body.firstname,
            MiddleName: req.body.middlename,
            LastName: req.body.lastname,
            Name:
              req.body.firstname +
              " " +
              req.body.middlename +
              " " +
              req.body.lastname,
            Gender: req.body.gender,
            DOB: req.body.dob,
            MartialStatus: req.body.married,
            Mobile: req.body.mobile,
            Mail: req.body.mail,
            JoinDate: req.body.joindate,
            ConfirmationDate: req.body.confirmationdate,
            TerminationDate: req.body.terminationdate,
            Prohibition: req.body.prohibition,
            Idtype: req.body.idtype,
            IDNumber: req.body.idnumber,
            Department: req.body.department,
            Designation: req.body.designation,
            SubCompany: req.body.subcompany,
            Timing: req.body.timing,
            WifiName: req.body.wifiname,
            WeekName: req.body.weekdayname,
            WeekDay: req.body.numofday,
            GpsTrack: req.body.gpstrack,
            AccountName:req.body.accountname,
            BankName:req.body.bankname,
            AccountNumber:req.body.accountnumber,
            IFSCCode:req.body.ifsccode,
            BranchName:req.body.branchname,
            MICRCode:req.body.micrcode,
            UPICode:req.body.upicode,
            ProfileImage: req.files.employeeimage[0].filename,
            CertificateImage: req.files.employeedocument[0].filename,
            CertificateImage1: req.files.employeedocument2[0].filename,

          },
          (err, record) => {
            var result = {};
            if (err) {
              result.Message = "Employee Not Updated";
              result.Data = err;
              result.isSuccess = false;
            } else {
              if (record.length == 0) {
                result.Message = "Employee Not Updated";
                result.Data = [];
                result.isSuccess = false;
              } else {
                result.Message = "Employee Updated";
                result.Data = record;
                result.isSuccess = true;
              }
            }
            res.json(result);
          }
        );
      }

      else if(req.files.employeedocument2 != undefined && req.files.employeedocument3 != undefined){
        employeeSchema.findByIdAndUpdate(
          req.body.id,
          {
            FirstName: req.body.firstname,
            MiddleName: req.body.middlename,
            LastName: req.body.lastname,
            Name:
              req.body.firstname +
              " " +
              req.body.middlename +
              " " +
              req.body.lastname,
            Gender: req.body.gender,
            DOB: req.body.dob,
            MartialStatus: req.body.married,
            Mobile: req.body.mobile,
            Mail: req.body.mail,
            JoinDate: req.body.joindate,
            ConfirmationDate: req.body.confirmationdate,
            TerminationDate: req.body.terminationdate,
            Prohibition: req.body.prohibition,
            Idtype: req.body.idtype,
            IDNumber: req.body.idnumber,
            Department: req.body.department,
            Designation: req.body.designation,
            SubCompany: req.body.subcompany,
            Timing: req.body.timing,
            WifiName: req.body.wifiname,
            WeekName: req.body.weekdayname,
            WeekDay: req.body.numofday,
            GpsTrack: req.body.gpstrack,
            AccountName:req.body.accountname,
            BankName:req.body.bankname,
            AccountNumber:req.body.accountnumber,
            IFSCCode:req.body.ifsccode,
            BranchName:req.body.branchname,
            MICRCode:req.body.micrcode,
            UPICode:req.body.upicode,
            CertificateImage1: req.files.employeedocument2[0].filename,
            CertificateImage2: req.files.employeedocument3[0].filename,
          },
          (err, record) => {
            var result = {};
            if (err) {
              result.Message = "Employee Not Updated";
              result.Data = err;
              result.isSuccess = false;
            } else {
              if (record.length == 0) {
                result.Message = "Employee Not Updated";
                result.Data = [];
                result.isSuccess = false;
              } else {
                result.Message = "Employee Updated";
                result.Data = record;
                result.isSuccess = true;
              }
            }
            res.json(result);
          }
        );
      }

      else if(req.files.employeeimage != undefined && req.files.employeedocument != undefined && req.files.employeedocument2 != undefined && req.files.employeedocument3 != undefined){
        employeeSchema.findByIdAndUpdate(
          req.body.id,
          {
            FirstName: req.body.firstname,
            MiddleName: req.body.middlename,
            LastName: req.body.lastname,
            Name:
              req.body.firstname +
              " " +
              req.body.middlename +
              " " +
              req.body.lastname,
            Gender: req.body.gender,
            DOB: req.body.dob,
            MartialStatus: req.body.married,
            Mobile: req.body.mobile,
            Mail: req.body.mail,
            JoinDate: req.body.joindate,
            ConfirmationDate: req.body.confirmationdate,
            TerminationDate: req.body.terminationdate,
            Prohibition: req.body.prohibition,
            Idtype: req.body.idtype,
            IDNumber: req.body.idnumber,
            Department: req.body.department,
            Designation: req.body.designation,
            SubCompany: req.body.subcompany,
            Timing: req.body.timing,
            WifiName: req.body.wifiname,
            WeekName: req.body.weekdayname,
            WeekDay: req.body.numofday,
            GpsTrack: req.body.gpstrack,
            AccountName:req.body.accountname,
            BankName:req.body.bankname,
            AccountNumber:req.body.accountnumber,
            IFSCCode:req.body.ifsccode,
            BranchName:req.body.branchname,
            MICRCode:req.body.micrcode,
            UPICode:req.body.upicode,
            ProfileImage: req.files.employeeimage[0].filename,
            CertificateImage: req.files.employeedocument[0].filename,
            CertificateImage1: req.files.employeedocument2[0].filename,
            CertificateImage2: req.files.employeedocument3[0].filename,
          },
          (err, record) => {
            var result = {};
            if (err) {
              result.Message = "Employee Not Updated";
              result.Data = err;
              result.isSuccess = false;
            } else {
              if (record.length == 0) {
                result.Message = "Employee Not Updated";
                result.Data = [];
                result.isSuccess = false;
              } else {
                result.Message = "Employee Updated";
                result.Data = record;
                result.isSuccess = true;
              }
            }
            res.json(result);
          }
        );
      }
    } else {
      res.json(permission);
    }
  } else if (req.body.type == "gettiming") {
    if(req.body.timingID==undefined){
      var record = await timingSchema.find();
      var result = {};
      if (record.length == 0) {
        result.Message = "Employee Not Updated";
        result.Data = [];
        result.isSuccess = false;
      } else {
        result.Message = "Employee Updated";
        result.Data = record;
        result.isSuccess = true;
      }
      res.json(result);
    } else if(req.body.timingID!=undefined) {
      var record = await timingSchema.findById(req.body.timingID);
      var result = {};
      if (record.length == 0) {
        result.Message = "Employee Not Updated";
        result.Data = [];
        result.isSuccess = false;
      } else {
        result.Message = "Employee Updated";
        result.Data = record;
        result.isSuccess = true;
      }
      res.json(result);
    }
  } else if (req.body.type == "getgpsemployee") {
    var permission = await checkpermission(req.body.type, req.body.token);
    if (permission.isSuccess == true) {
      var companyselection = await adminSchema.findById(req.body.token);
      if (companyselection.allaccessubcompany == true) {
        console.log(req.body);
        if(req.body.SubCompany == 0){
          employeeSchema.find({ GpsTrack:true}, (err, record) => {
            var result = {};
            if (err) {
              result.Message = "Employee Not Found";
              result.Data = err;
              result.isSuccess = false;
            } else {
              if (record.length == 0) {
                result.Message = "Employee Not Found";
                result.Data = [];
                result.isSuccess = false;
              } else {
                result.Message = "Employee Found";
                result.Data = record;
                result.isSuccess = true;
              }
            }
            res.json(result);
          });
        } else{
          employeeSchema.find({ SubCompany:companyselection.accessCompany,GpsTrack:true}, (err, record) => {
            var result = {};
            if (err) {
              result.Message = "Employee Not Found";
              result.Data = err;
              result.isSuccess = false;
            } else {
              if (record.length == 0) {
                result.Message = "Employee Not Found";
                result.Data = [];
                result.isSuccess = false;
              } else {
                result.Message = "Employee Found";
                result.Data = record;
                result.isSuccess = true;
              }
            }
            res.json(result);
          });
        }
      } else if(companyselection.allaccessubcompany == false){
        employeeSchema.find({ SubCompany:req.body.SubCompany,GpsTrack:true}, (err, record) => {
          var result = {};
          if (err) {
            result.Message = "Employee Not Found";
            result.Data = err;
            result.isSuccess = false;
          } else {
            if (record.length == 0) {
              result.Message = "Employee Not Found";
              result.Data = [];
              result.isSuccess = false;
            } else {
              result.Message = "Employee Found";
              result.Data = record;
              result.isSuccess = true;
            }
          }
          res.json(result);
        });
      } 
    }
    
  } else if(req.body.type=="getfilterdata"){
    var sid = req.body.subcompanyid  == 0 ? 0 : req.body.subcompanyid;
    if(req.body.subcompanyid == 0){
      var record = await employeeSchema.find().populate("SubCompany");
    } else{
      var record = await employeeSchema.find({SubCompany:req.body.subcompanyid}).populate("SubCompany");
    }
    var result = {};
        if (record.length == 0) {
        result.Message = "Employee Not Found";
        result.Data = [];
        result.isSuccess = false;
        } else {
        result.Message = "Employee Found";
        result.Data = record;
        result.isSuccess = true;
        }
        res.json(result);
  }
});

router.post("/employeeLeave", async function(req,res,next){
  const { EmpId } = req.body;
  try {
    var record = await leaveSchema.find({ 
                                    EmployeeId: mongoose.Types.ObjectId(EmpId), 
                                    })
                                  .populate({
                                    path: "SubCompany"
                                  })
                                  .populate({
                                    path: "Company"
                                  })
                                  .populate({
                                    path: "Reason"
                                  });
    if(record){
      res.status(200).json({ isSuccess: true , Count: record.length , Data: record , Message: "Data Found" });
    }else{
      res.status(400).json({ isSuccess: true , Dsta: 0 , Message: "Not found" });
    }
  } catch (error) {
    res.status(500).json({ isSuccess: false , Message: error.message });
  }
});

router.post("/employeeMemo", async function(req,res,next){
  const { EmpId } = req.body;
  try {
    var record = await memoSchema.find({ 
                                    Eid: mongoose.Types.ObjectId(EmpId), 
                                    });
    if(record){
      res.status(200).json({ isSuccess: true , Count: record.length , Data: record , Message: "Data Found" });
    }else{
      res.status(400).json({ isSuccess: true , Dsta: 0 , Message: "Not found" });
    }
  } catch (error) {
    res.status(500).json({ isSuccess: false , Message: error.message });
  }
});

router.post("/updateFcmToken" , async function(req,res,next){
  const { empId , fcmToken } = req.body;
  try {
    var empData = await employeeSchema.find({ _id: empId });
    console.log(empData.length);
    if(empData){
      let updateFcmToEmp = await employeeSchema.findByIdAndUpdate(empId, { fcmToken: fcmToken });
      res.status(200).json({ isSuccess: true , Data: 1 , Message: "You Got It" });
    }else{
      res.status(200).json({ isSuccess: true , Data: 0 , Message: "Employee Not Found" });
    }
    // console.log(empData);
  } catch (error) {
    res.status(500).json({ isSuccess: false , Message: error.message });
  }
});

// router.post("/test" , async function())
//CRON-JOB -----------------12/12/2020---MONIL
var task = cron.schedule('0 */2 * * * *', async () => {
  // var userData = await employeeSchema.aggregate([
  //   { $match: { Mobile: "9429828152" } }
  // ]);
  var userData = await employeeSchema.find({ "fcmToken" : { $exists : true } });
  if(userData.length > 0){
    console.log("yeah in.......!!!");
    console.log(userData.length);
    // console.log(userData);
    for(let i=0;i<userData.length;i++){
      let fcmTokenIs = userData[i].fcmToken
      fcmTokenIs = String(fcmTokenIs);
      console.log(fcmTokenIs);
      sendNotificationForGPS(fcmTokenIs);  
    }
  }
});

function sendNotificationForGPS(fcm){
    console.log("yupppppp...........!!!!!!!!!");
    var payload = {
            "to": fcm,
            "priority":"high",
            "content_available":true,
            "data": {
                "sound": "Check",
                "click_action": "CHECK"
            },
            "notification":{
                        "body": "Stay Safe , Happy and Workoholic",
                        "title":"Check",
                        "badge":1
                    }
    };
    var options = {
        'method': 'POST',
        'url': 'https://fcm.googleapis.com/fcm/send',
        'headers': {
            'authorization': 'Key=AAAAA0I-7-A:APA91bGFNldrcEnSCIQ-1ijrwPbzjrITduokHMkdySXIwK5YPvV6joy4CJfROV1hCjx7KCAz36_ZAwlOr7qGFVOCoB5phR34lDwTr71wuXf3DLsFrvLzTG3Ur1ghRQVPvUX-cGoCsjZT',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    };
    request(options, function (error, response ) {
        if (error) {
            console.log(error.message);
        } else {
            console.log("Sending Notification");
            console.log(response.body);
        }
    });
}


async function checkpermission(type, token) {
  var result = {};
  if (token != undefined) {
    var admindetails;
    if (type == "insert") {
      admindetails = await adminSchema.find({ _id: token, "Employee.A": 1 });
    } else if (type == "getdata") {
      admindetails = await adminSchema.find({ _id: token, "Employee.V": 1 });
    } else if (type == "getemployee" || type == "update" || type == "getsingledata") {
      admindetails = await adminSchema.find({ _id: token, "Employee.U": 1 });
    }

    if (admindetails.length != 0) {
      result.Message = "";
      result.Data = [];
      result.isSuccess = true;
    } else {
      result.Message = "You don't have access.";
      result.Data = [];
      result.isSuccess = false;
    }
  } else {
    result.Message = "You don't have a valid token.";
    result.Data = [];
    result.isSuccess = false;
  }
  return result;
}

module.exports = router;
