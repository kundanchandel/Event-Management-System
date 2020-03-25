var bodyparser      = require("body-parser");
var express         = require("express"); 
var app             = express();
var mongoose        = require("mongoose");
var passport        = require("passport");
var LocalStrategy   = require("passport-local");
var methodOverride  = require("method-override"); // for method="DELETE"

/*************************************MODELS*************************************/
var Services        = require("./models/services");
var User            = require("./models/user");
var Vendor          = require("./models/vendor");

/*************************************PASSPORT CONFIGURATION*************************************/
app.use(require("express-session")({
    secret:"anything",
    resave:false,
    saveUninitialized:false
})); 
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new LocalStrategy(Vendor.authenticate()));
passport.serializeUser(Vendor.serializeUser());
passport.deserializeUser(Vendor.deserializeUser());

app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(methodOverride("_method"));

mongoose.connect('mongodb://localhost/event',function(err){
if(err) throw err;
console.log("connected to db...");
});

/**********************************************************************************************************
                                            INDEX ROUTE
***********************************************************************************************************/
app.get("/",function(req,res){
   res.render("index");
});


/**********************************************************************************************************
                                    USER LOGIN AND REGISTER ROUTES
***********************************************************************************************************/
app.get("/user/login",function(req,res){
    res.render("user/login");
});

app.get("/user/register",function(req,res){
    res.render("user/register");
});

app.post("/user/register",function(req,res){
    console.log(req.body);
    var newUser = new User({username:req.body.username, email:req.body.email});
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/user/register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/");
        })
    });
});
app.post("/user/login",passport.authenticate('local',{
        successRedirect:"/",
        failureRedirect:"/user/login"
    }),function(req,res){
});

/**********************************************************************************************************
                                VENDOR  ROUTES
***********************************************************************************************************/
app.get("/profile",function(req,res){
    res.render("vendor/profile.ejs");
});

app.get("/addService",function(req,res){
    res.render("vendor/addService.ejs");
});

/**********************************************************************************************************
                                VENDOR REGISTER AND LOGIN ROUTES
***********************************************************************************************************/
app.get("/vendor/login",function(req,res){
    res.render("vendor/login");
});

app.get("/vendor/register",function(req,res){
    res.render("vendor/register");
});

app.post("/vendor/register",function(req,res){
    console.log(req.body);
    var newVendor = new Vendor({username:req.body.username, email:req.body.email});
    Vendor.register(newVendor,req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/Vendor/register");
        }
        passport.authenticate("local")(req,res,function(){
            console.log("registereed...");
            res.redirect("/");
        })
    });
});

app.post("/vendor/login",passport.authenticate('local',{
    successRedirect:"/profile",
    failureRedirect:"/vendor/login"
}),function(req,res){
});



/**********************************************************************************************
**********************************************************************************************/
app.listen(7000,function(){
    console.log("serving...");
});