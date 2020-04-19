var mongoose = require("mongoose");
//var passportLocalMongoose = require("passport-local-mongoose");

var vendorSchema = new mongoose.Schema({
    username     :String,
    password     :String,
    email        :String,
    contact      :String,
    bussinessName:String,
    description  :String,
    services     :[
           {
                type:mongoose.Schema.Types.ObjectId,
                ref :"Service"
           }
    ]
});

//vendorSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Vendor",vendorSchema);
