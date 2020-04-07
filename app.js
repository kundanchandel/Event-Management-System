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

app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(methodOverride("_method"));

app.use(cookieParser());

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
        res.redirect("/")
    }else{
        res.send("email already exist")
    }
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
            res.cookie('authToken',token,{
                maxAge:2628000000, //1 month in mili sec
                httpOnly:true
            });
            res.redirect("/");
        }
    }
});
app.get("/logout",isLoggedIn,function(req,res){
    res.cookie('authToken',"",{
        maxAge:-1
    });
    res.redirect("/");
});
/**********************************************************************************************************
                                VENDOR  ROUTES
***********************************************************************************************************/
app.get("/vendor/profile",isLoggedIn,function(req,res){
    res.render("vendor/profile.ejs");
});

app.get("/vendor/addService",function(req,res){
    res.render("vendor/addService.ejs");
});

app.post("/vendor/addService",isLoggedIn,upload.array('images', 5),function(req,res){
    console.log(req.user)
    res.send("add services")
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


app.post("/vendor/register",async function(req,res){
    const emailExist = await Vendor.findOne({email:req.body.email});
    if(!emailExist){
    const salt = await bcrypt.genSalt(10);
    const hashedPassword =await bcrypt.hash(req.body.password,salt)
    var vendor = new Vendor({username:req.body.username, email:req.body.email,password:hashedPassword});
    vendor.save()
    res.redirect("/")
    }else{
        res.send("email already exist...");
    }
});

app.post("/vendor/login",async function(req,res){
    const vendor = await Vendor.findOne({email:req.body.email});
    if(!vendor){
        res.send("email does't exist")
    }else{
        const validpass =await bcrypt.compare(req.body.password,vendor.password)
        if(!validpass){
            res.send("Invalid password")
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

/**********************************************************************************************************
                                MIDDLEWARES
***********************************************************************************************************/
function isLoggedIn(req,res,next){
    const token = req.cookies.authToken
    console.log("token:" + token)
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