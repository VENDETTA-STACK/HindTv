/*Importing Modules */
var express = require("express");
var router = express.Router();
var subcompanySchema = require("../models/subcompany.models");
var attendeanceSchema = require("../models/attendance.models");
var employeeSchema = require("../models/employee.model");
const geolib = require("geolib");
var mongoose  = require("mongoose");
var dateFormat = require("dateformat");
const e = require("express");
var moment = require("moment-timezone");
var memoSchema = require("../models/memo.model");
var adminSchema = require("../models/admin.model");
var leaveSchema = require("../models/leave.model");
/*Importing Modules */

var convertedDate = function () {
  var now = new Date();
  date = dateFormat(now, "isoDateTime");
  date =
    date[8] +
    date[9] +
    "/" +
    date[5] +
    date[6] +
    "/" +
    date[0] +
    date[1] +
    date[2] +
    date[3];
  return date;
};

router.post("/", async (req, res) => {
  // if (req.body.type = "getdata") {
  //   var result = {};
  //   convertedDate(); //fetch date
  //   try{
  //       var date = convertedDate();
  //       var data = [];
  //       var Attendance;
  //       var SubCompanyName;
  //       let test =  await attendeanceSchema.find().populate({
  //         path: 'EmployeeId',
  //         populate:'SubCompany'
  //       });
  //       var subcompany = await subcompanySchema.find();
  //       for (var index = 0; index < subcompany.length; index++) {
  //         SubCompanyName = subcompany[index].Name;
  //         var employee = await employeeSchema.find({SubCompany: subcompany[index]._id,});
  //         for (var employeeIndex = 0;employeeIndex < employee.length;employeeIndex++) {
  //             attendance = await attendeanceSchema.find({Date: date,EmployeeId: employee[employeeIndex]._id});
  //             Attendance = attendance.length;
  //         }
  //         data[index] = { Attendance, SubCompanyName };
  //       }
  //       result.Message = "Record Found";
  //       result.Data = data;
  //       result.isSuccess  = true;
  //   }
  //   catch(err){
  //     result.Message = "Record Not Found";
  //     result.Data = [];
  //     result.isSuccess  = false;
  //   }
  //   res.json(result);

  // } else 
  if(req.body.type == "getempdata"){
    var date = moment()
      .tz("Asia/Calcutta")
      .format("DD MM YYYY, h:mm:ss a")
      .split(",")[0];
    date = date.split(" ");
    date = date[0] + "/" + date[1] + "/" + date[2];
    var companyselection = await adminSchema.findById(req.body.token);
    if (companyselection.allaccessubcompany == true) {
      var record = await attendeanceSchema.find({Date:date,Status:"in"});
      var result = {};
      if(record.length == 0){
        result.Message = "No Data Found.";
        result.Data = [];
        result.isSuccess = false;
      } else{
        result.Message = "Data Found.";
        result.Data = record.length;
        result.isSuccess = true;
      }
      res.json(result);
    } else{
      //var record = await attendeanceSchema.find({SubCompany: companyselection.accessCompany,Date:date,Status:"in"});
      var record = await attendeanceSchema.aggregate([
        {
            $match:{
              Date : date,
              Status:"in"
            }
        },
        {
            $lookup:{
                from: "employees",
                localField: "EmployeeId",
                foreignField: "_id",
                as: "EmployeeId"
            }
        },
        { "$unwind": "$EmployeeId" },
        {
            $match:{
                "EmployeeId.SubCompany":mongoose.Types.ObjectId(companyselection.accessCompany),
            }
        }
        ]);

      var result = {};
      if(record.length == 0){
        result.Message = "No Data Found.";
        result.Data = [];
        result.isSuccess = false;
      } else{
        result.Message = "Data Found.";
        result.Data = record.length;
        result.isSuccess = true;
      }
      res.json(result);
    }
      
  } else if(req.body.type == "countmemo"){
    var date = moment()
      .tz("Asia/Calcutta")
      .format("DD MM YYYY, h:mm:ss a")
      .split(",")[0];
    date = date.split(" ");
    date = date[0] + "/" + date[1] + "/" + date[2];
    var companyselection = await adminSchema.findById(req.body.token);
    if (companyselection.allaccessubcompany == true) {
      var record = await memoSchema.find({Date:date});
      var result = {};
      if(record.length == 0){
        result.Message = "No Data Found.";
        result.Data = [];
        result.isSuccess = false;
      } else{
        result.Message = "Data Found.";
        result.Data = record.length;
        result.isSuccess = true;
      }
      res.json(result);
    } else {
      var record = await memoSchema.aggregate([
        {
            $match:{
              Date : date,
            }
        },
        {
            $lookup:{
                from: "employees",
                localField: "Eid",
                foreignField: "_id",
                as: "EmployeeId"
            }
        },
        { "$unwind": "$EmployeeId" },
        {
            $match:{
                "EmployeeId.SubCompany":mongoose.Types.ObjectId(companyselection.accessCompany),
            }
        }
        ]);
      var result = {};
      if(record.length == 0){
        result.Message = "No Data Found.";
        result.Data = [];
        result.isSuccess = false;
      } else{
        result.Message = "Data Found.";
        result.Data = record.length;
        result.isSuccess = true;
      }
      res.json(result);
    }
    
  } else if(req.body.type == "getwifiemp"){
      var date = moment()
      .tz("Asia/Calcutta")
      .format("DD MM YYYY, h:mm:ss a")
      .split(",")[0];
    date = date.split(" ");
    date = date[0] + "/" + date[1] + "/" + date[2];
    var companyselection = await adminSchema.findById(req.body.token);
    if (companyselection.allaccessubcompany == true) {
      var record = await attendeanceSchema.find({Date:date,AttendanceType:"WIFI"});
      var result = {};
      if(record.length == 0){
        result.Message = "No Data Found.";
        result.Data = [];
        result.isSuccess = false;
      } else{
        result.Message = "Data Found.";
        result.Data = record.length;
        result.isSuccess = true;
      }
    res.json(result);
    } else {
      //var record = await attendeanceSchema.find({SubCompany: companyselection.accessCompany,Date:date,AttendanceType:"WIFI"});
      var record = await attendeanceSchema.aggregate([
      {
          $match:{
            Date : date,
            AttendanceType:"WIFI"
          }
      },
      {
          $lookup:{
              from: "employees",
              localField: "EmployeeId",
              foreignField: "_id",
              as: "EmployeeId"
          }
      },
      { "$unwind": "$EmployeeId" },
      {
          $match:{
              "EmployeeId.SubCompany":mongoose.Types.ObjectId(companyselection.accessCompany),
          }
      }
      ]);
      var result = {};
      if(record.length == 0){
        result.Message = "No Data Found.";
        result.Data = [];
        result.isSuccess = false;
      } else{
        result.Message = "Data Found.";
        result.Data = record.length;
        result.isSuccess = true;
      }
      res.json(result);
    }
  } else if(req.body.type == "getgpsemp"){
    var date = moment()
      .tz("Asia/Calcutta")
      .format("DD MM YYYY, h:mm:ss a")
      .split(",")[0];
    date = date.split(" ");
    date = date[0] + "/" + date[1] + "/" + date[2];
    var companyselection = await adminSchema.findById(req.body.token);
    if (companyselection.allaccessubcompany == true) {
      var record = await attendeanceSchema.find({Date:date,AttendanceType:"GPS"});
      var result = {};
      if(record.length == 0){
        result.Message = "No Data Found.";
        result.Data = [];
        result.isSuccess = false;
      } else{
        result.Message = "Data Found.";
        result.Data = record.length;
        result.isSuccess = true;
      }
      res.json(result);
    } else {
      var record = await attendeanceSchema.aggregate([
        {
            $match:{
              Date : date,
              AttendanceType:"GPS"
            }
        },
        {
            $lookup:{
                from: "employees",
                localField: "EmployeeId",
                foreignField: "_id",
                as: "EmployeeId"
            }
        },
        { "$unwind": "$EmployeeId" },
        {
            $match:{
                "EmployeeId.SubCompany":mongoose.Types.ObjectId(companyselection.accessCompany),
            }
        }
        ]);
      var result = {};
      if(record.length == 0){
        result.Message = "No Data Found.";
        result.Data = [];
        result.isSuccess = false;
      } else{
        result.Message = "Data Found.";
        result.Data = record.length;
        result.isSuccess = true;
      }
      res.json(result);
    }
  } else if(req.body.type == "getempnum"){
    var companyselection = await adminSchema.findById(req.body.token);
    if (companyselection.allaccessubcompany == true) {
      var record = await employeeSchema.find();
      var result = {};
      if(record.length == 0){
        result.Message = "No Data Found.";
        result.Data = [];
        result.isSuccess = false;
      } else{
        result.Message = "Data Found.";
        result.Data = record.length;
        result.isSuccess = true;
      }
      res.json(result);
    } else {
      var record = await employeeSchema.find({SubCompany: companyselection.accessCompany });
      var result = {};
      if(record.length == 0){
        result.Message = "No Data Found.";
        result.Data = [];
        result.isSuccess = false;
      } else{
        result.Message = "Data Found.";
        result.Data = record.length;
        result.isSuccess = true;
      }
      res.json(result);
    }
  } else if(req.body.type == "countleave"){
  //   var date = moment()
  //   .tz("Asia/Calcutta")
  //   .format("DD MM YYYY, h:mm:ss a")
  //   .split(",")[0];
  // date = date.split(" ");
  // date = date[0] + "/" + date[1] + "/" + date[2];
    var date = new Date();
    date = date.toISOString().split("T")[0];
    date = date+"T00:00:00.000+00:00"
    var companyselection = await adminSchema.findById(req.body.token);
    if (companyselection.allaccessubcompany == true) {
      var record = await leaveSchema.find({LeaveStatus:"Pending",});
      var result = {};
      if(record.length == 0){
        result.Message = "No Data Found.";
        result.Data = [];
        result.isSuccess = false;
      } else{
        result.Message = "Data Found.";
        result.Data = record.length;
        result.isSuccess = true;
      }
      res.json(result);
    } else{
      // ?var record = await leaveSchema.find({SubCompany: companyselection.accessCompany,ApplyDate:date,LeaveStatus:"Rejected"});
      var record = await leaveSchema.find({SubCompany: companyselection.accessCompany, LeaveStatus:"Pending"});
      var result = {};
      if(record.length == 0){
        result.Message = "No Data Found.";
        result.Data = [];
        result.isSuccess = false;
      } else{
        result.Message = "Data Found.";
        result.Data = record.length;
        result.isSuccess = true;
      }
      res.json(result);
    }
  }
});

router.post("/getempdataWeb", async function(req,res,next){
  const { adminId } = req.body;
  var date = moment()
      .tz("Asia/Calcutta")
      .format("DD MM YYYY, h:mm:ss a")
      .split(",")[0];
    date = date.split(" ");
    
  try {
    var companyselection = await adminSchema.find({ _id : adminId })
                                            .populate({
                                              path: "accessCompany",
                                            });
    console.log(companyselection[0].accessCompany._id);
    var employeesOfSubCompany = await employeeSchema.find({ SubCompany : companyselection[0].accessCompany._id});
    // console.log(employeesOfSubCompany);
    var employee_ids = []
    for(var i=0 ; i<employeesOfSubCompany.length ;i++ ){
      employee_ids.push(employeesOfSubCompany[i]._id)
    }
    // console.log(employee_ids);
    // console.log(date);
    let checkDate = date[0] + "/" + date[1] + "/" + date[2];
    // console.log(checkDate);
    var record = await attendeanceSchema.find({ Date: checkDate , EmployeeId: { $in: employee_ids } });
      if(record){
        res.status(200).json({ isSuccess: true ,Count: record.length , Data: record , Message: "Attendance Data Found" });
      }else{
        res.status(200).json({ isSuccess: true , Data: 0 , Message: "Attendance Data Not Found" });
      }
  } catch (error) {
    res.status(500).json({ isSuccess: false , Message: error.message })
  }
});

module.exports = router;
