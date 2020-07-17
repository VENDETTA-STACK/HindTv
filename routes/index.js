var express = require("express");
var router = express.Router();
var path = require("path");
const multer = require("multer");
var firebase = require("firebase-admin");
var moment = require("moment-timezone");
var companySchema = require("../models/company.models");
var subcompanySchema = require("../models/subcompany.models");
var employeeSchema = require("../models/employee.model");
var attendeanceSchema = require("../models/attendance.models");
var timingSchema = require("../models/timing.models");
var thoughtSchema = require("../models/thoughts.model");
const geolib = require("geolib");
const geolocationutils = require("geolocation-utils");
const { stat } = require("fs");
var attendImg = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    console.log(file);
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

router.post("/company", function (req, res, next) {
  if (req.body.type == "insert") {
    var record = new companySchema({
      Name: req.body.name,
      Address: req.body.address,
      ContactPersonName: req.body.contactpersonname,
      ContactPersonNumber: req.body.contactpersonnumber,
      Email: req.body.email,
      GSTIN: req.body.gstin,
    });
    record.save({}, function (err, record) {
      var result = {};
      if (err) {
        result.Message = "Company Not Inserted";
        result.Data = [];
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "Company Not Inserted";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "New Company Inserted";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  } else if (req.body.type == "getdata") {
    companySchema.find({}, (err, record) => {
      var result = {};
      if (err) {
        result.Message = "Company Not Found";
        result.Data = [];
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "Company Not Found";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "Company Found.";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  } else if (req.body.type == "getcompany") {
    companySchema.find({ _id: req.body.id }, (err, record) => {
      var result = {};
      if (err) {
        result.Message = "Company Not Found";
        result.Data = [];
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "Company Not Found";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "Company Found";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  } else if (req.body.type == "update") {
    companySchema.findByIdAndUpdate(
      req.body.id,
      {
        Name: req.body.name,
        Address: req.body.address,
        ContactPersonName: req.body.contactpersonname,
        ContactPersonNumber: req.body.contactpersonnumber,
        Email: req.body.email,
        GSTIN: req.body.gstin,
      },
      (err, record) => {
        var result = {};
        if (err) {
          result.Message = "Company Not Updated";
          result.Data = err;
          result.isSuccess = false;
        } else {
          if (record.length == 0) {
            result.Message = "Company Not Updated";
            result.Data = [];
            result.isSuccess = false;
          } else {
            result.Message = "Company Updated";
            result.Data = record;
            result.isSuccess = true;
          }
        }
        res.json(result);
      }
    );
  }
});

router.post("/subcompany", function (req, res, next) {
  if (req.body.type == "insert") {
    req.body.lat = req.body.lat == undefined ? 0 : req.body.lat;
    req.body.long = req.body.long == undefined ? 0 : req.body.long;
    var record = new subcompanySchema({
      Name: req.body.name,
      Address: req.body.address,
      ContactPersonName: req.body.contactpersonname,
      ContactPersonNumber: req.body.contactpersonnumber,
      Email: req.body.Email,
      GSTIN: req.body.GSTIN,
      Status: "Active",
      CompanyId: req.body.companyid,
      lat: parseFloat(req.body.lat),
      long: parseFloat(req.body.long),
      Link: req.body.googlelink,
      Timing: req.body.timing,
    });
    record.save({}, function (err, record) {
      console.log(err);
      var result = {};
      if (err) {
        result.Message = "Record Not Inserted";
        result.Data = [];
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
  } else if (req.body.type == "getdata") {
    subcompanySchema
      .find()
      .populate("CompanyId")
      .then((record) => {
        var result = {};
        if (record.length == 0) {
          result.Message = "SubCompany Not Found";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "SubCompany Inserted";
          result.Data = record;
          result.isSuccess = true;
        }
        res.json(result);
      });
  } else if (req.body.type == "getcompany") {
    companySchema.find({}, (err, record) => {
      var result = {};
      if (err) {
        result.Message = "Company Not Found";
        result.Data = [];
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "Company Not Found";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "Company Found";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  } else if (req.body.type == "getsinglecompany") {
    subcompanySchema.find({ CompanyId: req.body.CompanyId }, (err, record) => {
      var result = {};
      if (err) {
        result.Message = "SubCompany Not Found";
        result.Data = err;
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "SubCompany Not Found";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "SubCompany Found";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  } else if (req.body.type == "getsubcompanydetail") {
    subcompanySchema.find({ _id: req.body.id }, (err, record) => {
      var result = {};
      if (err) {
        result.Message = "SubCompany Not Found";
        result.Data = err;
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "SubCompany Not Found";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "SubCompany Found";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  } else if (req.body.type == "update") {
    req.body.lat = req.body.lat == undefined ? 0 : req.body.lat;
    req.body.long = req.body.long == undefined ? 0 : req.body.long;
    subcompanySchema.findByIdAndUpdate(
      req.body.id,
      {
        Name: req.body.name,
        Address: req.body.address,
        ContactPersonName: req.body.contactpersonname,
        ContactPersonNumber: req.body.contactpersonnumber,
        Email: req.body.Email,
        GSTIN: req.body.GSTIN,
        Status: "Active",
        CompanyId: req.body.companyid,
        lat: parseFloat(req.body.lat),
        long: parseFloat(req.body.long),
        Link: req.body.googlelink,
        Timing: req.body.timing,
      },
      (err, record) => {
        var result = {};
        if (err) {
          result.Message = "SubCompany Not Updated";
          result.Data = err;
          result.isSuccess = false;
        } else {
          if (record.length == 0) {
            result.Message = "SubCompany Not Updated";
            result.Data = [];
            result.isSuccess = false;
          } else {
            result.Message = "SubCompany Updated";
            result.Data = record;
            result.isSuccess = true;
          }
        }
        res.json(result);
      }
    );
  }
});

router.post("/employee", async function (req, res, next) {
  if (req.body.type == "insert") {
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
      MartialStatus: req.body.martialstatus,
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
  } else if (req.body.type == "getdata") {
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
  } else if (req.body.type == "getsingledata") {
    var record = await employeeSchema
      .find({ _id: req.body.id })
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
  } else if (req.body.type == "getsubcompany") {
    subcompanySchema.find({}, function (err, record) {
      var result = {};
      if (record.length == 0) {
        result.Message = "Sub Company Not Found";
        result.Data = [];
        result.isSuccess = false;
      } else {
        result.Message = "Sub Company Found";
        result.Data = record;
        result.isSuccess = true;
      }
      res.json(result);
    });
  } else if (req.body.type == "getsubcompanyemployee") {
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
  } else if (req.body.type == "getemployee") {
    var record = await employeeSchema.find({ _id: req.body.id });
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
  } else if (req.body.type == "update") {
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
        MartialStatus: req.body.martialstatus,
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
});

router.post("/login", function (req, res, next) {
  if (req.body.type == "login") {
    employeeSchema.find({ Mobile: req.body.number }, function (err, record) {
      var result = {};
      if (err) {
        result.Message = "Employee Not Found";
        result.Data = [];
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
});

function getdate() {
  moment.locale("en-in");
  var attendance = {};
  var date = moment()
    .tz("Asia/Calcutta")
    .format("DD MM YYYY, h:mm:ss a")
    .split(",")[0];
  date = date.split(" ");
  date = date[0] + "/" + date[1] + "/" + date[2];
  var time = moment()
    .tz("Asia/Calcutta")
    .format("DD MM YYYY, h:mm:ss a")
    .split(",")[1];
  var day = moment().tz("Asia/Calcutta").format("dddd");
  attendance.date = date;
  attendance.time = time;
  attendance.day = day;
  return attendance;
}
router.post("/attendance", upload.single("attendance"), async function (
  req,
  res,
  next
) {
  console.log(req.body);
  period = getdate();
  if (req.body.type == "in") {
    var longlat = await employeeSchema
      .find({ _id: req.body.employeeid })
      .populate("SubCompany");
    console.log(req.body.latitude);
    console.log(req.body.longitude);
    if (
      longlat[0]["SubCompany"].lat == 0 ||
      longlat[0]["SubCompany"].long == 0
    ) {
      var result = {};
      result.Message =
        "Attendance Not Marked, Latitude and Longitude Not Found of Company";
      result.Data = [];
      result.isSuccess = false;
      res.json(result);
    } else if (req.body.latitude == "" || req.body.longitude == "") {
      var result = {};
      result.Message =
        "Attendance Not Marked, Latitude and Longitude Not Found of Employee";
      result.Data = [];
      result.isSuccess = false;
      res.json(result);
    } else {
      const location1 = {
        lat: parseFloat(longlat[0]["SubCompany"].lat),
        lon: parseFloat(longlat[0]["SubCompany"].long),
      };
      const location2 = {
        lat: parseFloat(req.body.latitude),
        lon: parseFloat(req.body.longitude),
      };
      heading = geolib.getDistance(location1, location2);
      var NAME = longlat[0]["SubCompany"].Name;
      var area =
        heading > 25
          ? "http://www.google.com/maps/place/" +
            req.body.latitude +
            "," +
            req.body.longitude
          : NAME;
      var record = attendeanceSchema({
        EmployeeId: req.body.employeeid,
        Status: req.body.type,
        Date: period.date,
        Time: period.time,
        Day: period.day,
        Image: req.file.filename,
        Area: area,
        Elat: req.body.latitude,
        Elong: req.body.longitude,
        Distance: heading,
      });
      record.save({}, function (err, record) {
        var result = {};
        if (err) {
          result.Message = "Attendance Not Marked";
          result.Data = [];
          result.isSuccess = false;
        } else {
          if (record.length == 0) {
            result.Message = "Attendance Not Marked";
            result.Data = [];
            result.isSuccess = false;
          } else {
            result.Message = "Attendance Marked";
            result.Data = [record];
            result.isSuccess = true;
          }
        }
        res.json(result);
      });
    }
  } else if (req.body.type == "out") {
    var longlat = await employeeSchema
      .find({ _id: req.body.employeeid })
      .populate("SubCompany");
    if (
      longlat[0]["SubCompany"].lat == 0 ||
      longlat[0]["SubCompany"].long == 0
    ) {
      var result = {};
      result.Message =
        "Attendance Not Marked, Latitude and Longitude Not Found of Company";
      result.Data = [];
      result.isSuccess = false;
      res.json(result);
    } else if (req.body.latitude == "" || req.body.longitude == "") {
      var result = {};
      result.Message =
        "Attendance Not Marked, Latitude and Longitude Not Found of Employee";
      result.Data = [];
      result.isSuccess = false;
      res.json(result);
    } else {
      const location1 = {
        lat: parseFloat(longlat[0]["SubCompany"].lat),
        lon: parseFloat(longlat[0]["SubCompany"].long),
      };
      const location2 = {
        lat: parseFloat(req.body.latitude),
        lon: parseFloat(req.body.longitude),
      };
      heading = geolib.getDistance(location1, location2);
      var NAME = longlat[0]["SubCompany"].Name;
      var area =
        heading > 25
          ? "http://www.google.com/maps/place/" +
            req.body.latitude +
            "," +
            req.body.longitude
          : NAME;
      var record = attendeanceSchema({
        EmployeeId: req.body.employeeid,
        Status: req.body.type,
        Date: period.date,
        Time: period.time,
        Day: period.day,
        Image: req.file.filename,
        Area: area,
        Elat: req.body.latitude,
        Elong: req.body.longitude,
        Distance: heading,
      });
      record.save({}, function (err, record) {
        var result = {};
        if (err) {
          result.Message = "Attendance Not Marked";
          result.Data = [];
          result.isSuccess = false;
        } else {
          if (record.length == 0) {
            result.Message = "Attendance Not Marked";
            result.Data = [];
            result.isSuccess = false;
          } else {
            result.Message = "Attendance Marked";
            result.Data = [record];
            result.isSuccess = true;
          }
        }
        res.json(result);
      });
    }
  } else if (req.body.type == "getdata") {
    const day = req.body.day;
    const sdate = req.body.sd == "" ? undefined : req.body.sd;
    const edate = req.body.ed == "" ? undefined : req.body.ed;
    const area = req.body.afilter;
    const status = req.body.status;
    let query = {};
    if (req.body.rm == 0) {
      if (day) {
        if (day != "All") {
          query.Day = day;
        }
      }
      if (sdate != undefined || edate != undefined) {
        query.Date = {
          $gte: sdate,
          $lte: edate,
        };
      }
      if (area) {
        if (area == 0) {
        } else if (area == 2) {
          query.Area = { $regex: "http://www.google.com/maps/place/" };
        } else {
          query.Area = area;
        }
      }
      if (status) {
        if (status == 0) {
        } else if (status == 1) {
          query.Status = "in";
        } else if (status == 2) {
          query.Status = "out";
        }
      }
    }
    var record = await attendeanceSchema.find(query).populate("EmployeeId");
    var result = {};
    if (record.length == 0) {
      result.Message = "Attendance Not Found";
      result.Data = [];
      result.isSuccess = false;
    } else {
      result.Message = "Attendance Found";
      result.Data = record;
      result.isSuccess = true;
    }
    res.json(result);
  } else if (req.body.type == "getsingle") {
    if (req.body.afilter == 0) {
      var record = await attendeanceSchema
        .find({ EmployeeId: req.body.EmployeeId })
        .populate("EmployeeId");
    } else if (req.body.afilter == 1) {
      var record = await attendeanceSchema
        .find({ EmployeeId: req.body.EmployeeId, Area: "Inside Area" })
        .populate("EmployeeId");
    } else {
      var record = await attendeanceSchema
        .find({ EmployeeId: req.body.EmployeeId, Area: "Outside Area" })
        .populate("EmployeeId");
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
  } else if (req.body.type == "getareafilter") {
    subcompanySchema.find({}, (err, record) => {
      var result = {};
      if (err) {
        result.Message = "SubComapny Not Found";
        result.Data = [];
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "SubComapny Not Found";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "SubComapny Found";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  }
});

router.post("/location", async (req, res) => {
  var dbRef = firebase.database().ref("Database");
  const data = await dbRef.once("value", function (snapshot) {
    return snapshot.val();
  });
  res.json(data);
});

router.post("/timing", async (req, res) => {
  if (req.body.type == "insert") {
    var record = timingSchema({
      Name: req.body.name,
      StartTime: req.body.st,
      EndTime: req.body.et,
    });
    record.save({}, (err, record) => {
      var result = {};
      if (err) {
        result.Message = "Timing Not Inserted";
        result.Data = [];
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "Timing Not Inserted";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "New Timing Inserted";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  } else if (req.body.type == "getdata") {
    timingSchema.find({}, (err, record) => {
      var result = {};
      if (err) {
        result.Message = "Timing Not Found";
        result.Data = [];
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "Timing Not Found";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "Timing Found";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  } else if (req.body.type == "getsingletimedata") {
    timingSchema.find({ _id: req.body.id }, (err, record) => {
      var result = {};
      if (err) {
        result.Message = "Timing Not Inserted";
        result.Data = [];
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "Timing Not Inserted";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "New Timing Inserted";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  } else if (req.body.type == "update") {
    timingSchema.findByIdAndUpdate(
      req.body.id,
      { Name: req.body.name, StartTime: req.body.st, EndTime: req.body.et },
      (err, record) => {
        var result = {};
        if (err) {
          result.Message = "Timing Not Updated";
          result.Data = [];
          result.isSuccess = false;
        } else {
          if (record.length == 0) {
            result.Message = "Timing Not Updated";
            result.Data = [];
            result.isSuccess = false;
          } else {
            result.Message = "Timing Updated";
            result.Data = record;
            result.isSuccess = true;
          }
        }
        res.json(result);
      }
    );
  }
});

router.post("/thought", async (req, res) => {
  if (req.body.type == "insert") {
    var record = thoughtSchema({
      Quote: req.body.quote,
      // Name: req.body.name,
      Status: false,
    });
    record.save({}, (err, record) => {
      var result = {};
      if (err) {
        result.Message = "Thought Not Inserted";
        result.Data = [];
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "Thought Not Inserted";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "New Thought Inserted";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  } else if (req.body.type == "getalldata") {
    thoughtSchema.find({}, (err, record) => {
      var result = {};
      if (err) {
        result.Message = "No Thought Found";
        result.Data = [];
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "No Thought Found";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "Thought Found";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  } else if (req.body.type == "getsingledata") {
    thoughtSchema.findOne({ Status: true }, (err, record) => {
      var result = {};
      if (err) {
        result.Message = "No Thought Found";
        result.Data = [];
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "No Thought Found";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "Thought Found";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  } else if (req.body.type == "getdata") {
    thoughtSchema.findById(req.body.id, (err, record) => {
      var result = {};
      if (err) {
        result.Message = "No Thought Found";
        result.Data = [];
        result.isSuccess = false;
      } else {
        if (record.length == 0) {
          result.Message = "No Thought Found";
          result.Data = [];
          result.isSuccess = false;
        } else {
          result.Message = "Thought Found";
          result.Data = record;
          result.isSuccess = true;
        }
      }
      res.json(result);
    });
  } else if (req.body.type == "update") {
    thoughtSchema.findByIdAndUpdate(
      req.body.id,
      {
        Quote: req.body.quote,
        // Name: req.body.name,
      },
      (err, record) => {
        var result = {};
        if (err) {
          result.Message = "Thought Not Updated";
          result.Data = [];
          result.isSuccess = false;
        } else {
          if (record.length == 0) {
            result.Message = "Thought Not Updated";
            result.Data = [];
            result.isSuccess = false;
          } else {
            result.Message = "Thought Updated";
            result.Data = record;
            result.isSuccess = true;
          }
        }
        res.json(result);
      }
    );
  } else if (req.body.type == "statusupdate") {
    if (req.body.sts == 0) {
      thoughtSchema.findByIdAndUpdate(
        req.body.id,
        { Status: false },
        (err, record) => {
          var result = {};
          if (err) {
            result.Message = "Error Occurred";
            result.Data = [];
            result.isSuccess = false;
          } else {
            if (record.length == 0) {
              result.Message = "Error Occurred";
              result.Data = [];
              result.isSuccess = false;
            } else {
              result.Message = "Status updated to block";
              result.Data = record;
              result.isSuccess = true;
            }
          }
          res.json(result);
        }
      );
    } else {
      record = await thoughtSchema.find({ Status: true });
      if (record.length < 1) {
        thoughtSchema.findByIdAndUpdate(
          req.body.id,
          { Status: true },
          (err, record) => {
            var result = {};
            if (err) {
              result.Message = "Error Occurred";
              result.Data = [];
              result.isSuccess = false;
            } else {
              if (record.length == 0) {
                result.Message = "Error Occurred";
                result.Data = [];
                result.isSuccess = false;
              } else {
                result.Message = "Status updated to unblock";
                result.Data = record;
                result.isSuccess = true;
              }
            }
            res.json(result);
          }
        );
      } else {
        var result = {};
        result.Message =
          "Status can't be updated as there is one thought which is unblock";
        result.Data = [];
        result.isSuccess = false;
        res.json(result);
      }
    }
  }
});

router.post("/birthday", async (req, res) => {
  var date = moment()
    .tz("Asia/Calcutta")
    .format("DD MM YYYY, h:mm:ss a")
    .split(",")[0];
  date = date.split(" ");
  date = date[0] + "/" + date[1] + "/" + date[2];
  var record = await employeeSchema
    .find({ DOB: date })
    .populate("SubCompany", "Name");
  var result = {};
  if (record.length == 0) {
    result.Message = "Birthday Not Found";
    result.Data = [];
    result.isSuccess = false;
  } else {
    result.Message = "Birthday Found";
    result.Data = [];
    for (i = 0; i < record.length; i++) {
      data = {
        Message: "Many many happy returns of the day from DL Team",
        Name: record[i].Name + " - " + record[i].SubCompany.Name,
        Mobile: record[i].Mobile,
      };
      result.Data.push(data);
    }
    result.isSuccess = true;
  }
  res.json(result);
});

router.post("/testing", async (req, res) => {
  var location1 = {
    lat: parseFloat(21.1915798),
    lon: parseFloat(72.8556223),
  };
  var location2 = {
    lat: parseFloat(21.1916376),
    lon: parseFloat(72.8578122),
  };
  heading = geolib.getDistance(location1, location2);
  console.log(heading);
  var location1 = {
    lat: parseFloat(21.191579818725586),
    lon: parseFloat(72.8578109741211),
  };
  var location2 = {
    lat: parseFloat(21.1916376),
    lon: parseFloat(72.8578122),
  };
  heading = geolib.getDistance(location1, location2);
  console.log(heading);
});
module.exports = router;
