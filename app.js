var bodyparser      = require("body-parser");
var express         = require("express"); 
var app             = express();
var mongoose        = require("mongoose");
var bcrypt          = require("bcrypt")
var jwt             = require("jsonwebtoken");
var cookieParser    = require("cookie-parser");
var methodOverride  = require("method-override"); // for method="DELETE"
var dotenv          = require("dotenv");
dotenv.config()

/*************************************MODELS*************************************/
var Services        = require("./models/services");
var User            = require("./models/user");
var Vendor          = require("./models/vendor");

var userRoutes = require("./routes/user");
var vendorRoutes = require("./routes/vendor");

app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(cookieParser());

mongoose.connect(process.env.MONGODB,function(err){
if(err) throw err;
console.log("connected to db...");
});

app.get("/",function(req,res){
   res.render("index");
});

app.get("/logout",function(req,res){
    res.cookie('authToken',"",{
        maxAge:-1
    });
    res.redirect("/");
});

app.get("/services/:id",(req,res)=>{
    Services.findById(req.params.id,(err,service)=>{
        if(err){
            console.log(err);
        }else{
            res.render("service",{service:service});
        }
    });
})

app.get("/provider/profile/:id",(req,res)=>{
    Vendor.findById(req.params.id).populate("services").exec(function(err,vendor){
        if(err){
            console.log(err);
        }else{
            res.render("profile.ejs",{vendor:vendor});
        }
    });
});



app.use("/user",userRoutes);
app.use("/vendor",vendorRoutes);

app.listen(process.env.PORT || 7000,function(){
    console.log("serving...");
});