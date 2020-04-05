var bodyparser      = require("body-parser");
var express         = require("express"); 
var app             = express();
var mongoose        = require("mongoose");
var passport        = require("passport");
var bcrypt          = require("bcrypt")
var jwt             = require("jsonwebtoken");
var LocalStrategy   = require("passport-local");
var methodOverride  = require("method-override"); // for method="DELETE"
var dotenv          = require("dotenv");
dotenv.config()

/*************************************MODELS*************************************/
var Services        = require("./models/services");
var User            = require("./models/user");
var Vendor          = require("./models/vendor");

app.use('/uploads',express.static("uploads"))

/*************************************MULTER*************************************/
var multer  = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+ file.originalname)
    }
  })   
var upload = multer({ storage: storage })

/*************************************PASSPORT CONFIGURATION*************************************/
app.use(require("express-session")({
    secret:"anything",
    resave:false,
    saveUninitialized:false
})); 
app.use(passport.initialize());
app.use(passport.session());

// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

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

app.post("/user/register",async function(req,res){    
    const emailExist = await User.findOne({email:req.body.email});
    if(!emailExist){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword =await bcrypt.hash(req.body.password,salt)
        var user = new User({username:req.body.username, email:req.body.email, password:hashedPassword});
        user.save()
        console.log(user)
        res.redirect("/")
    }else{
        res.send("email already exist")
    }
    //hash password
    
});
app.post("/user/login",async function(req,res){
    const user = await User.findOne({email:req.body.email});
    if(!user){
        res.send("email does't exist")
    }else{
        const validpass =await bcrypt.compare(req.body.password,user.password)
        if(!validpass){
            res.send("Invalid password")
        }else{
            const token = jwt.sign({_id:user._id},process.env.TOKEN_SECRET);
            res.header('auth-token',token)
            res.set('auth-token',token);
           // console.log(token);
            res.redirect("/");
        }
    }
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

app.post("/vendor/addService",upload.array('images', 5),function(req,res){
    console.log(req.body)
    console.log(req.files)
    console.log(req.user)
    console.log(req.vendor)
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

app.get("/secret",isLoggedIn,function(req,res){
    console.log(req.user)
});
/**********************************************************************************************************
                                MIDDLEWARES
***********************************************************************************************************/
function isLoggedIn(req,res,next){
    console.log(res.header('auth-token'))
    console.log(req.header)
    const token = req.header('auth-token');
    if(!token){
        res.send("access denied");
    }else{
        const verified = jwt.verify(token,process.env.TOKEN_SECRET);
        req.user = verified;
        next()
    }
}

/**********************************************************************************************
**********************************************************************************************/
app.listen(7000,function(){
    console.log("serving...");
});