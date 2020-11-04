var express = require("express");
var router = express.Router();
var apkVersionSchema = require("../models/apkVersion");
var adminSchema = require("../models/admin.model");

router.post("/" , async function(req,res,next){
    const { androidVersion , iosVersion , latestApkUrl } = req.body;

    try {
        let apkDetails = await new apkVersionSchema({
            androidVersion : androidVersion,
            iosVersion : iosVersion,
            latestApkUrl : latestApkUrl,
        });
        var record = apkDetails.save();
        if(record.length == 0){
            res.status(400).json({ isSuccess : true , Data : 0 , Message : "No Data Add...!!!" });
        }else{
            res.status(200).json({ isSuccess : true , Data : record , Message : "Data Added...!!!" });
        }
    } catch (error) {
        res.status(500).json({ isSuccess : false , Message : error.message });
    }
});

router.post("/updateVersion" , async function(req,res,next){
    const { androidVersion , iosVersion , latestApkUrl } = req.body;
    try {
        let getOldVersion = await apkVersionSchema.find();
        let id = getOldVersion[0]._id;
        let updates = {
            androidVersion: androidVersion,
            iosVersion: iosVersion,
            latestApkUrl: latestApkUrl
        }
        if(getOldVersion.length == 1){
            var record = await apkVersionSchema.findByIdAndUpdate(id ,updates);
            res.status(200).json({ isSuccess:true , Data: 1 , Message: "Updated" });
        }else{
            res.status(400).json({ isSuccess:true , Data: 0 , Message: "Update Faild" });
        }
    } catch (error) {
        res.status(500).json({ isSuccess: false , Message: error.message});
    }
});

router.post("/getApkData", async function(req,res,next){
    
    try {
        var record = await apkVersionSchema.find();
        if(record.length == 0){
            res.status(400).json({ isSuccess : true , Data : 0 , Message : "No Data Found...!!!" });
        }else{
            res.status(200).json({ isSuccess : true , Data : record , Message : "Data Found...!!!" });
        }
    } catch (error) {
        res.status(500).json({ isSuccess : false , Message : error.message });
    }
    
});

module.exports = router;