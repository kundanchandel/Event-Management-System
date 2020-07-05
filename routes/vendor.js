var express         = require("express"); 
var router          = express.Router({mergeParams:true});
var Vendor            = require("../models/vendor");
var Services        = require("../models/services");
var mongoose        = require("mongoose");
var bcrypt          = require("bcrypt")
var jwt             = require("jsonwebtoken");
var cookieParser    = require("cookie-parser");

function isLoggedIn(req,res,next){
    const token = req.cookies.authToken
    if(!token){
        req.flash("error","You must be logged in to do that");
    }else{
        const verified = jwt.verify(token,process.env.TOKEN_SECRET);
        if(req.user != verified){
            req.user = verified;
        }
        next()
    }
}

router.get("/profile",isLoggedIn,function(req,res){
    Vendor.findById(req.user._id).populate("services").exec(function(err,vendor){
        if(err){
            console.log(err);
        }else{ 
            res.render("vendor/profile.ejs",{vendor:vendor});
        }
    });
});

router.get("/addService",isLoggedIn,function(req,res){
    res.render("vendor/addService.ejs");
});

router.post("/addService",isLoggedIn,function(req,res){
    var images = [req.body.image0,req.body.image1,req.body.image2]
    var newService ={
        type: req.body.type,
        city: req.body.city,
        description: req.body.description,
        price: req.body.price,
        image: images
    };
    Vendor.findById(req.user._id,function(err,vendor){
        if(err){
            console.log(err);
        }else{
            Services.create(newService,function(err,service){
                if(err){
                    console.log(err)
                }else{
                    service.provider.id = vendor._id;
                    service.provider.username = vendor.username;
                    service.save();
                    vendor.services.push(service);
                    vendor.save();
                }
            });
            req.flash("success",'Service added')
            res.redirect("/vendor/profile");
        }
    })
});

router.get("/login",function(req,res){
    res.render("auth/loginVendor");
});

router.get("/register",function(req,res){
    res.render("auth/registerVendor");
});


router.post("/register",async function(req,res){
    const emailExist = await Vendor.findOne({email:req.body.email});
    if(!emailExist){
    if(req.body.password!==req.body.password1){
        req.flash("error",'error: Password does\'t match')
        res.redirect('/vendor/register');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword =await bcrypt.hash(req.body.password,salt)
    var vendor = new Vendor({
        username:req.body.username,
        email:req.body.email,
        contactNo:req.body.contactNo,
        description:req.body.description,
        address:req.body.address,
        password:hashedPassword
    });
    vendor.save()
    req.flash("success","Registration successfull, Now log into your account.");
    res.redirect("/vendor/login")
    }else{
        req.flash("error",'Error: Email Already exist')
        res.redirect("/vendor/register");
    }
});

router.post("/login",async function(req,res){
    const vendor = await Vendor.findOne({email:req.body.email});
    if(!vendor){
        req.flash("error",'Error: Invalid credentials')
    }else{
        const validPass =await bcrypt.compare(req.body.password,vendor.password)
        if(!validPass){
            req.flash("error",'Error: Invalid credentials')
        }else{
            const token = jwt.sign({_id:vendor._id},process.env.TOKEN_SECRET);
            res.cookie('authToken',token,{
                maxAge:2628000000, //1 month in mili sec
                httpOnly:true
            });
            res.redirect("/vendor/profile");
        }
    }
});

module.exports = router;