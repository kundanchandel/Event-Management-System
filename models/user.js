var mongoose = require("mongoose");
//var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    services     :[
        {
             type:mongoose.Schema.Types.ObjectId,
             ref :"Service"
        }
 ]
});

//userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);