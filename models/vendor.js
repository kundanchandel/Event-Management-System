var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var vendorSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    services:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref :"Services"
        }
    ]
});

vendorSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Vendor",vendorSchema);