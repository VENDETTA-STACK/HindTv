/*Importing Modules */
var express = require("express");
const { result, isUndefined, conforms } = require("lodash");
var router = express.Router();
var gpstrackingSchema = require("../models/gpstracking.model");
var config = require("../config");
var employeeSchema = require("../models/employee.model");
var moment = require("moment-timezone");
var subcompanylocationSchema = require("../models/location.model");
var attendanceSchema = require("../models/attendance.models");
const geolib = require("geolib");
const { replaceOne, count } = require("../models/gpstracking.model");
var NodeGeocoder = require('node-geocoder');
const { get } = require("../app");

/*Importing Modules */

//localhost:port/api/gpstracking/
//API for tracking employee in MAP.
//ALL API is working.
//Created by Dhanpal 29.09

async function currentLocation(id) {
    var CourierRef = config.docref.child(id);
    const data = await CourierRef.once("value")
         .then((snapshot) => snapshot.val())
         .catch((err) => err);
    return data;
}

router.post("/", async function(req,res){
    //Not Working..
    if(req.body.type == "insert"){
        /*       
        console.log("call");
        var employee;
        var date = moment()
            .tz("Asia/Calcutta")
            .format("DD MM YYYY, h:mm:ss a")
            .split(",")[0];
        date = date.split(" ");
        date = date[0] + "/" + date[1] + "/" + date[2];
        employee =  await attendanceSchema.find({Date:date}).select("EmployeeId");
        if(employee.length == 0 || employee.length == null){
            var result = {};
                result.Message = "No One is present today.";
                result.Data = [];
                result.isSuccess = false;
                res.json(result);
        }
        for(var index=0;index<employee.length;index++){
            var mobileNo = await employeeSchema.find({_id:employee[index].EmployeeId,GpsTrack:true}).select('Mobile');
            // if(mobileNo == null ){
            //     var result = {};
            //     result.Message="Employee is not found.";
            //     result.Data=[];
            //     result.isSuccess=false;
            //     res.json(result);
            // } else if(mobileNo.length == 0){
            //     var result = {};
            //     result.Message="Employee is not found.";
            //     result.Data=[];
            //     result.isSuccess=false;
            //     res.json(result);
            // }
            if(mobileNo[0] != null){
                var location = await currentLocation(mobileNo[0].Mobile);
                console.log(location);
                if(location!=null){
                    var time = moment()
                        .tz("Asia/Calcutta")
                        .format("DD MM YYYY, h:mm:ss a")
                        .split(",")[1];
                    var date = new Date();
                    date = date.toISOString().split("T")[0];
                    var record = gpstrackingSchema({
                        EmployeeId:employee[0].EmployeeId,
                        Date:date,
                        Time:time,
                        Latitude:location.latitude,
                        Longitude:location.longitude
                    });
                    record.save({}, function(err,record){
                        var result = {};
                        if(err){
                            result.Message="Location is not Inserted.";
                            result.Data=[];
                            result.isSuccess=false;
                        } else {
                            if(record.length == 0){
                                result.Message="Location is not Inserted.";
                                result.Data=[];
                                result.isSuccess=false;
                            }
                            else{
                                result.Message="Location is Inserted.";
                                result.Data=record;
                                result.isSuccess=true;
                            }
                        }
                    });
                }
            }
            else{
                index++;
            }
        }
        
    */}
    else if(req.body.type == "getdata"){
        var subcompanylocation = await subcompanylocationSchema.find();
        // console.log(subcompanylocation);

        var options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyCW-CryHApwFarrX9piqmNKo-E_ZxAlYJU', // for Mapquest, OpenCage, Google Premier
            formatter: 'json' // 'gpx', 'string', ...
          };
           
        var geoCoder = NodeGeocoder(options);
        

        async function getLocationName(latt,longg){

            var locationNameIs = await geoCoder.reverse({ lat: latt, lon: longg });
            // geoCoder.reverse({lat:lat, lon:long})
            //     .then((res)=> {
            //         // console.log(res);
            //         // console.log(res[0].formattedAddress);
            //         locationNameIs = res[0].formattedAddress;
            //     })
            //     .catch((err)=> {
            //         console.log(err);
            //     });
        
            // console.log(locationNameIs[0].formattedAddress);
            // console.log(locationNameIs[0].formattedAddress);
            // console.log([latt,longg]);
            return locationNameIs[0].formattedAddress;
        }


        var record = await gpstrackingSchema.find({EmployeeId:req.body.employeeid,Date:req.body.date});
        for(var empIndex = 0;empIndex<record.length;empIndex++){
            var distance = 10000000;
            var emplat = parseFloat(record[empIndex].Latitude);
            emplng = parseFloat(record[empIndex].Longitude);

            for(var compIndex = 0;compIndex<subcompanylocation.length;compIndex++){
                var tempdistance = 0;
                var complat = subcompanylocation[compIndex].Latitude ,complng = subcompanylocation[compIndex].Longitude,name =  subcompanylocation[compIndex].Name ;
                
                tempdistance = calculatelocation(name,complat,complng,emplat,emplng);
                //console.log(tempdistance);
                console.log([emplat,emplng]);
                
                if(distance>tempdistance && tempdistance>=0){
                    console.log("in ifffffffffffffffffffff");
                    distance=tempdistance;
                    var myLocationNameIs = await getLocationName(emplat,emplng);
                    
                    record[empIndex]={"Name": myLocationNameIs,"Time":record[empIndex].Time,"Latitude":record[empIndex].Latitude,"Longitude":record[empIndex].Longitude,"Distance":distance};
                }
            }
        }
        // console.log(req.body);
        var result = {};
        if(record.length == 0){
            result.Message="Tracking data is not found.";
            result.Data=[];
            result.isSuccess=false;
        }
        else{
            result.Message="Tracking data is found.";
            result.Data=record;
            result.isSuccess=true;
        }
        res.json(result);
    }
});

// Oct 26,2020 - Get Today Gps Location  
router.post("/getTodayLocation" , async function(req,res,next){
    let toDayDate = new Date();
    // toDayDate.setDate(25);
    // console.log(toDayDate);
    let toDayDateInString = toDayDate.toISOString().split("T")[0];
    // var subcompanylocation = await subcompanylocationSchema.find();
    try {
        let empLocationData = await gpstrackingSchema.find({ Date : toDayDateInString });
        // for(var empIndex = 0;empIndex<empLocationData.length;empIndex++){
        //     var distance = 10000;
        //     var emplat = empLocationData[empIndex].Latitude;
        //     emplng = empLocationData[empIndex].Longitude;
        //     for(var compIndex = 0;compIndex<subcompanylocation.length;compIndex++){
        //         var tempdistance = 0;
        //         var complat = subcompanylocation[compIndex].Latitude ,complng = subcompanylocation[compIndex].Longitude,name =  subcompanylocation[compIndex].Name ;
        //         tempdistance = calculatelocation(name,complat,complng,emplat,emplng);
        //         if(distance>tempdistance && tempdistance>=0){
        //             distance=tempdistance;
        //             empLocationData[empIndex]={"Name":name,"Time":empLocationData[empIndex].Time,"Latitude":empLocationData[empIndex].Latitude,"Longitude":empLocationData[empIndex].Longitude,"Distance":distance};
        //         }
        //     }
        // }
        console.log(empLocationData);
        if(empLocationData.length == 0){
            res.status(200).json({ isSuccess : true , Message : "No Today Data Found" , Data : empLocationData });
        }else{
            res.status(200).json({ isSuccess : true , Message : "Data Found" , Data : empLocationData });
        }   
    } catch (error) {
        res.status(500).json({ isSuccess : false , Message : error.message});
    }
});

setInterval(gpstrack,1800000); //setinterval for server
//setInterval(gpstrack,60000);  //setinterval for localhost
//setInterval(gpstrack,60000);
//function for fetching lat,lng from firebase & store  in mongodb.
// async function gpstrack(){
//     var date = moment()
//         .tz("Asia/Calcutta")
//         .format("DD MM YYYY, h:mm:ss a")
//         .split(",")[0];
//     date = date.split(" ");
//     date = date[0]+"/"+date[1]+"/"+date[2];
//     var presentEmployee  = await attendanceSchema.find({Date:date,Status:"in"}).select("EmployeeId");
//     if(presentEmployee.length !=0){
//         for(var employeeIndex = 0;employeeIndex<presentEmployee.length;employeeIndex++){
//             var dutystatus = await dutyStatus(presentEmployee[employeeIndex].EmployeeId,date);
//             if(dutystatus == 1){
//                 var mobileNo = await employeeSchema.findById(presentEmployee[employeeIndex].EmployeeId).select("Mobile");
//                 var location = await currentLocation(mobileNo.Mobile);
//                 if(location != null){
//                     console.log(mobileNo._id);
//                     var locationstatus = await locationStatus(mobileNo._id,location.latitude,location.longitude);
//                     console.log(locationstatus);
//                     if(locationstatus == 1){
//                         var time = moment()
//                                     .tz("Asia/Calcutta")
//                                     .format("DD MM YYYY, h:mm:ss a")
//                                     .split(",")[1];
//                         var date = new Date();
//                         date = date.toISOString().split("T")[0];
//                         var record = gpstrackingSchema({
//                             EmployeeId:mobileNo._id,
//                             Date:date,
//                             Time:time,
//                             Latitude:location.latitude,
//                             Longitude:location.longitude
//                         });
//                         record.save({}, function(err,record){
//                             var result = {};
//                             if(err){
//                                 result.Message="Location is not Inserted.";
//                                 result.Data=[];
//                                 result.isSuccess=false;
//                             } else {
//                                 if(record.length == 0){
//                                     result.Message="Location is not Inserted.";
//                                     result.Data=[];
//                                     result.isSuccess=false;
//                                 }
//                                 else{
//                                     result.Message="Location is Inserted.";
//                                     result.Data=record;
//                                     result.isSuccess=true;
//                                 }
//                             }
//                         });
//                     }
//                 }
//                 // console.log(presentEmployee[employeeIndex].EmployeeId,date,presentEmployee[employeeIndex].EmployeeId,presentEmployee[employeeIndex].EmployeeId);
//                 // var locationstatus = await locationStatus(presentEmployee[employeeIndex].EmployeeId,date,presentEmployee[employeeIndex].EmployeeId,presentEmployee[employeeIndex].EmployeeId);
//             }
//         }
//     }
// }
router.post("/test", async function(req,res,next){
    try {
        console.log("Check");
        sendNotificationForGPS();
        res.status(200).json({ isSuccess : true });
    } catch (error) {
        res.status(500).json({ isSuccess: false , Message: error.message });
    }
});

async function sendNotificationForGPS(){
    var payload = {
        // "title": "Order Alert",
        // "body": "New Order Alert Found For You.",
        // "data": {
        //     "sound": "surprise.mp3",
        //     "orderid": courierfound[0].orderId.toString(),
        //     "distance": courierfound[0].distance.toString(),
        //     "click_action": "FLUTTER_NOTIFICATION_CLICK"
        // },
        // "to": courierfound[0].fcmToken
            "to":"cKdvF76EQsSjLJhgaamSx8:APA91bELykro3p158yETRF0a1sk-crrnKjoyioucvJqcxn7rIEFgXoo9IsNj4b6im7PsbWD1hEKwJaF7KcgA3Mpr-8-DPvzMHoH55O7yyJ_QgAl4GOgDWXpGlOQDJt4S9LsYI-hCaIqm",
            "priority":"high",
            "content_available":true,
            "data": {
                "sound": "surprise.mp3",
                "click_action": "FLUTTER_NOTIFICATION_CLICK"
            },
            "notification":{
                        "body": "Hello Bro",
                        "title":"Check",
                        "badge":1
                    }
    };
    var options = {
        'method': 'POST',
        'url': 'https://fcm.googleapis.com/fcm/send',
        'authorization': 'key=AAAAA0I-7-A:APA91bGFNldrcEnSCIQ-1ijrwPbzjrITduokHMkdySXIwK5YPvV6joy4CJfROV1hCjx7KCAz36_ZAwlOr7qGFVOCoB5phR34lDwTr71wuXf3DLsFrvLzTG3Ur1ghRQVPvUX-cGoCsjZT',
        'Content-Type': 'application/json',
        body: JSON.stringify(payload)
    };
    request(options, function (error, response) {
        if (error) {
            console.log(error.message);
        } else {
            console.log("Sending Notification");
            console.log(response.body);
        }
    });
}

 async function dutyStatus(EmpId,empdate){
    var record =  await attendanceSchema.find({EmployeeId:EmpId,Date:empdate}).select("Status");
    if(record.length == 1){
        return 1;
    } else if(record.length != 1 ){
        return 0;
    }    
}

async function locationStatus(EmpId,empdate,lat,lng){
    var empdate = new Date();
    empdate = empdate.toISOString().split("T")[0];
    var record =  await gpstrackingSchema.find({EmployeeId:EmpId,Date:empdate+'T00:00:00.000Z',Latitude:lat,Longitude:lng});  
    if(record.length == 0){
        return 1;
    } else if(record.length != 1){
        return 0;
    }
}

router.post("/getLocation", async function(req,res,next){
   const { employeeid , lat , long } = req.body;
   var time = moment()
            .tz("Asia/Calcutta")
            .format("DD MM YYYY, h:mm:ss a")
            .split(",")[1];
    var date = new Date();
    date = date.toISOString().split("T")[0];
    var dateForAttendance = moment()
    .tz("Asia/Calcutta")
    .format("DD MM YYYY, h:mm:ss a")
    .split(",")[0];
    dateForAttendance = dateForAttendance.split(" ");
    dateForAttendance = dateForAttendance[0] + "/" + dateForAttendance[1] + "/" + dateForAttendance[2];
    var employee = await attendanceSchema.find({ 
                            EmployeeId: employeeid,
                            Date: dateForAttendance,
                         });
    // console.log(employee);
    try {
        if(employee.length == 1){
            var record = await new gpstrackingSchema({
                EmployeeId:employeeid,
                Date:date,
                Time:time,
                Latitude:lat,
                Longitude:long,
            });
            if(record){
                record.save();
                res.status(200).json({ isSuccess: true , Data: record , Message: "New GpsTracking Data Added" });
            }else{
                res.status(200).json({ isSuccess: false , Data: 0 , Message: "Data not added" });
            }
        }else{
            res.status(200).json({ isSuccess: false , Data: 0 , Message: "Attendace Not Marked" });
        }
    } catch (error) {
        res.status(500).json({ isSuccess: false , Message: error.message });
    }
    
});

//Working API

async function gpstrack(){
    var employee;
    var date = moment()
    .tz("Asia/Calcutta")
    .format("DD MM YYYY, h:mm:ss a")
    .split(",")[0];
    date = date.split(" ");
    date = date[0] + "/" + date[1] + "/" + date[2];
    employee =  await attendanceSchema.find({Date:date}).select("EmployeeId");
    if(employee.length == 0 || employee.length == null){
        var result = {};
        result.Message = "No One is present today.";
        result.Data = [];
        result.isSuccess = false;
        res.json(result);
    }
    for(var index = 0; index<employee.length; index++){
        var mobileNo = await employeeSchema.find({_id:employee[index].EmployeeId,GpsTrack:true}).select('Mobile');
        if(mobileNo[0] != null || mobileNo.length != 0){
            var location = await currentLocation(mobileNo[0].Mobile);
            if(location!=null){
            var time = moment()
            .tz("Asia/Calcutta")
            .format("DD MM YYYY, h:mm:ss a")
            .split(",")[1];
            var date = new Date();
            date = date.toISOString().split("T")[0];
            // let locationName = await getLocationName(location.latitude,location.longitude);
            // console.log("hello---------------------------------------------------------");
            // console.log(locationName);
            var record = gpstrackingSchema({
                EmployeeId:employee[index].EmployeeId,
                Date:date,
                Time:time,
                Latitude:location.latitude,
                Longitude:location.longitude,
            });
            record.save({}, function(err,record){
                var result = {};
                if(err){
                    result.Message="Location is not Inserted.";
                    result.Data=[];
                    result.isSuccess=false;
                } else {
                    if(record.length == 0){
                        result.Message="Location is not Inserted.";
                        result.Data=[];
                        result.isSuccess=false;
                    }
                    else{
                        result.Message="Location is Inserted.";
                        result.Data=record;
                        result.isSuccess=true;
                    }
                }
            });
            console.log(record);
            }
        }
    }
}
//Function for finding distance of employee from subcompany
function calculatelocation(name, lat1, long1, lat2, long2) {
    if (lat1 == 0 || long1 == 0) {
      area = 1; // Company Lat and Long is not defined.
    } else {
      const location1 = {
        lat: parseFloat(lat1),
        lon: parseFloat(long1),
      };
      const location2 = {
        lat: parseFloat(lat2),
        lon: parseFloat(long2),
      };
      heading = geolib.getDistance(location1, location2);
      if (!isNaN(heading)) {
          return heading;
      } else {
        heading =  -1; // Employee Lat and Long is not defined.
    }
    return heading;
  }
}

module.exports = router;
