var bodyparser          = require("body-parser");
var express             = require("express"); 
var app                 = express();
var mongoose            = require("mongoose");
var bcrypt              = require("bcrypt")
var jwt                 = require("jsonwebtoken");
var cookieParser        = require("cookie-parser");
var methodOverride      = require("method-override"); 
var dotenv              = require("dotenv");
dotenv.config()
var flash       = require("connect-flash");
var Services            = require("./models/services");
var User                = require("./models/user");
var Vendor              = require("./models/vendor");
var userRoutes          = require("./routes/user");
var vendorRoutes        = require("./routes/vendor");
var userAndVendorRoutes = require("./routes/userAndVendor");

mongoose.connect(process.env.MONGODB,function(err){
    if(err) throw err;
    console.log("connected to db...");
})
app.use(flash());
app.use(require("express-session")({
    secret:"anything",
    resave:false,
    saveUninitialized:false
}));
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use('/',userAndVendorRoutes);
app.use("/user",userRoutes);
app.use("/vendor",vendorRoutes);

app.listen(process.env.PORT || 7000,function(){
    console.log("serving...");
});