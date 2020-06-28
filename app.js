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

app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(methodOverride("_method"));

app.use(cookieParser());

mongoose.connect(process.env.MONGODB,function(err){
if(err) throw err;
console.log("connected to db...");
});

/**********************************************************************************************************
                                            INDEX ROUTES
***********************************************************************************************************/
app.get("/",function(req,res){
   res.render("index");
});

app.get("/main",isLoggedIn,function(req,res){
    User.findById(req.user._id,function(err,user){
        if(err){
            console.log(err)
        }else{
            Services.find({},function(err,services){
                if(err){
                    console.log(err);
                }else{
                    res.render("main",{services:services,user:user});
                }
            });
        }
    })
});

/**********************************************************************************************************
                                    USER LOGIN AND REGISTER ROUTES
***********************************************************************************************************/
app.get("/user/login",function(req,res){
    res.render("login",{type:"user"});
});

app.get("/user/register",function(req,res){
    res.render("register",{type:"user"});
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
            res.redirect("/main");

        }
    }
});

app.get("/user/addService/:id",isLoggedIn,(req,res)=>{
    User.findById(req.user._id,(err,user)=>{
        if(err){
            console.log(err);
        }else{
            Services.findById(req.params.id,(err,service)=>{
                if(err){
                    console.log(err)
                }else{
                    user.services.push(service);
                    console.log(user)
                    user.save();
                    res.redirect("back")
                }
            });
        }
    });
});

app.get("/user/preview",isLoggedIn,(req,res)=>{
    User.findById(req.user._id).populate("services").exec(function(err,user){
        if(err){
            console.log(err);
        }else{ 
            console.log(user);
            res.render("user/preview",{user:user});
        }
    });
});

app.get("/logout",function(req,res){
    res.cookie('authToken',"",{
        maxAge:-1
    });
    res.redirect("/");
});
/**********************************************************************************************************
                                VENDOR  ROUTES
***********************************************************************************************************/
app.get("/vendor/profile",isLoggedIn,function(req,res){
    Vendor.findById(req.user._id).populate("services").exec(function(err,vendor){
        if(err){
            console.log(err);
        }else{ 
            res.render("vendor/profile.ejs",{vendor:vendor});
        }
    });
});

app.get("/vendor/addService",isLoggedIn,function(req,res){
    res.render("vendor/addService.ejs");
});

app.post("/vendor/addService",isLoggedIn,function(req,res){
    var images = [req.body.image0,req.body.image1,req.body.image2]
    var newService ={
        type: req.body.type,
        city: req.body.city,
        description: req.body.description,
        price: req.body.price,
        image: images
    };
    console.log(req.user)
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
                    //res.redirect("/user/profile");
                }
            });
        
            res.redirect("/vendor/profile");
        }
    })
});
/**********************************************************************************************************
                                VENDOR REGISTER AND LOGIN ROUTES
***********************************************************************************************************/
app.get("/vendor/login",function(req,res){
    res.render("login",{type:"vendor"});
});

app.get("/vendor/register",function(req,res){
    res.render("register",{type:"vendor"});
});


app.post("/vendor/register",async function(req,res){
    const emailExist = await Vendor.findOne({email:req.body.email});
    if(!emailExist){
    const salt = await bcrypt.genSalt(10);
    const hashedPassword =await bcrypt.hash(req.body.password,salt)
    var vendor = new Vendor({username:req.body.username, email:req.body.email,password:hashedPassword});
    vendor.save()
    res.redirect("/vendor/login")
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
/**********************************************************************************************
**********************************************************************************************/

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

/**********************************************************************************************
 *                          MIDDLEWARES
**********************************************************************************************/
/**********************************************************************************************************
                                MIDDLEWARES
***********************************************************************************************************/
function isLoggedIn(req,res,next){
    const token = req.cookies.authToken
    if(!token){
        res.send("<h1>You must be logged in to do that</h1>");
    }else{
        const verified = jwt.verify(token,process.env.TOKEN_SECRET);
        if(req.user != verified){
            req.user = verified;
        }
        next()
    }
}

/**********************************************************************************************
**********************************************************************************************/
app.listen(process.env.PORT || 7000,function(){
    console.log("serving...");
});