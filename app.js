/*Importing Modules */
var createError = require("http-errors");
var express = require("express");
var path = require("path");
const fs = require("fs");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cors = require("cors");
require("dotenv").config();
var firebase = require("firebase-admin");
var serviceAccount = require("./firebasekey.json");
/*Importing Modules */

/*Creating Routers*/
var indexRouter = require("./routes/index");
var companyRouter = require("./routes/company");
var thoughtRouter = require("./routes/thought");
var subcompanyRouter = require("./routes/subcompany");
var employeeRouter = require("./routes/employee");
var timingRouter = require("./routes/timing");
var locationRouter = require("./routes/location");
var memoRouter = require("./routes/memo");
var attendanceRouter = require("./routes/attendance");
var adminRouter = require("./routes/admin");
var bulkRouter = require("./routes/bulk");
var reportRouter = require("./routes/report");
var loginRouter = require("./routes/login");
var leavereasonRouter = require("./routes/leavereason");
var leaveformRouter = require("./routes/leaveform");
var defineleaveRouter = require("./routes/defineleave");
var dashboardRouter = require("./routes/dashboard");
var gpstrackRouter = require("./routes/gpstracking");
var subcompanylocationRouter = require("./routes/subcompanylocation");
var apkDataRouter = require("./routes/apkData");
// tnd 
// var tndindexRouter = require("./routes/tnd");
// var tndpersonRouter = require("./routes/tnd1");
// var tndloginRouter = require("./routes/tnd2");
/*Creating Routers*/

/*Initilizaing the app*/
var app = express();
app.use(cors());
/*Initilizaing the app*/

/*Connecting database with mongodb*/
mongoose.connect(process.env.MONGO, {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
/*Connecting database with mongodb*/

/*Connecting database with firebase*/
//  firebase.initializeApp({
//    credential: firebase.credential.cert(serviceAccount),
//    databaseURL: process.env.FIREBASE,
//  });

//For Fetching Employee Tracking
// var firedb = firebase.database();
// var docref = firedb.ref("Database");

/*Connecting database with firebase*/

// view engine setup -- Not been used.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

/*Initializing dependencies*/
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/uploads", express.static(__dirname + "/uploads"));
app.use("/api/reports", express.static(__dirname + "/reports"));
app.use("/api/bulk", express.static(__dirname + "/bulk"));
app.use(cors());
/*Initializing dependencies*/

/*Calling routers*/
app.use("/api/", indexRouter);
app.use("/api/company", companyRouter);
app.use("/api/subcompany", subcompanyRouter);
app.use("/api/thought", thoughtRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/timing", timingRouter);
app.use("/api/location", locationRouter);
app.use("/api/memo", memoRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/bulk", bulkRouter);
app.use("/api/admin", adminRouter);
app.use("/api/generatereport", reportRouter);
app.use("/api/login", loginRouter);
app.use("/api/leavereason",leavereasonRouter);
app.use("/api/leaveform",leaveformRouter);
app.use("/api/defineleave",defineleaveRouter);
app.use("/api/dashboard",dashboardRouter);
app.use("/api/gpstracking",gpstrackRouter);
app.use("/api/subcompnaylocation",subcompanylocationRouter);
app.use("/api/apkdetails",apkDataRouter);
// tnd 
// app.use('/api/tnd/tnd', tndindexRouter);
// app.use('/api/tnd/tnd_login', tndpersonRouter);
// app.use('/api/tnd/tnd_personal', tndloginRouter);

/*Calling routers*/

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
  console.log(err.message)
});
module.exports =  app;
