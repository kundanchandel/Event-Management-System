var express         = require("express"); 
var router          = express.Router({mergeParams:true});
var User            = require("../models/user");
var Services        = require("../models/services");
var mongoose        = require("mongoose");
var bcrypt          = require("bcrypt")
var jwt             = require("jsonwebtoken");
var cookieParser    = require("cookie-parser");

function isLoggedIn(req,res,next){
    const token = req.cookies.authToken
    if(!token){
        req.flash("error",'Error: You must be logged in to do that')
    }else{
        const verified = jwt.verify(token,process.env.TOKEN_SECRET);
        if(req.user != verified){
            req.user = verified;
        }
        next()
    }
}

router.get("/home",isLoggedIn,function(req,res){
    User.findById(req.user._id,function(err,user){
        if(err){
            console.log(err)
        }else{
            Services.find({},function(err,services){
                if(err){
                    console.log(err);
                }else{
                    res.render("user/home",{services:services,user:user});
                }
            });
        }
    })
});

router.get("/login",function(req,res){
    res.render("auth/loginUser");
});

router.get("/register",function(req,res){
    res.render("auth/registerUser");
});

router.post("/register",async function(req,res){    
    const emailExist = await User.findOne({email:req.body.email});
    if(!emailExist){
        if(req.body.password !== req.body.password1){
            req.flash("error",'Error:Password does\'t match')
            res.redirect("/user/register");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword =await bcrypt.hash(req.body.password,salt)
        var user =await new User({username:req.body.username, email:req.body.email, password:hashedPassword});
        await user.save()
        req.flash("success",'Registration successful, Now log in to your account')
        res.redirect("/user/login");
    }else{
        req.flash("error",'Error: Email already exist')
        res.redirect("/user/register");
    }
});

router.post("/login",async function(req,res){
    const user = await User.findOne({email:req.body.email});
    if(!user){
        req.flash("error",'Error: Invalid credentials')
        res.redirect('/user/login');
    }else{
        const validpass =await bcrypt.compare(req.body.password,user.password)
        if(!validpass){
            req.flash("error",'Error: Invalid credentials')
        }else{
            const token = jwt.sign({_id:user._id},process.env.TOKEN_SECRET);
            res.cookie('authToken',token,{
                maxAge:2628000000, //1 month in mili sec
                httpOnly:true
            });
            res.redirect("/user/home");
        }
    }
});

router.get("/addService/:id",isLoggedIn,(req,res)=>{
    User.findById(req.user._id,(err,user)=>{
        if(err){
            console.log(err);
        }else{
            Services.findById(req.params.id,(err,service)=>{
                if(err){
                    console.log(err)
                }else{
                    if(user.services.includes(service.provider.id)){
                        req.flash("error",'Service already added');
                    }else{
                        user.services.push(service);
                        user.save();
                        req.flash("success",'Service added to your basket and preview section');
                        res.redirect("back")
                    }
                }
            });
        }
    });
});

router.get("/preview",isLoggedIn,(req,res)=>{
    User.findById(req.user._id).populate("services").exec(function(err,user){
        if(err){
            console.log(err);
        }else{ 
            res.render("user/preview",{user:user});
        }
    });
});


module.exports = router;