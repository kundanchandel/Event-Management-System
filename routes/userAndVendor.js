const express = require('express');
const router = express.Router()
const Vendor = require('../models/vendor');
const Services = require('../models/services');


router.get("/",(req,res)=>{
    res.render("userAndVendor/index");
 });
 
router.get("/vendorProfile/:id",(req,res)=>{
    Vendor.findById(req.params.id).populate("services").exec(function(err,vendor){
        if(err){
            console.log(err);
        }else{
            res.render("userAndVendor/vendorProfile",{vendor:vendor});
        }
    });
});
router.get("/services/:id",(req,res)=>{
    Services.findById(req.params.id,(err,service)=>{
        if(err){
            console.log(err);
        }else{
            res.render("userAndVendor/service",{service:service});
        }
    });
})
router.get("/logout",(req,res)=>{
    res.cookie('authToken',"",{
        maxAge:-1
    });
    res.redirect("/");
});

module.exports = router;