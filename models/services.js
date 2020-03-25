var mongoose = require("mongoose");

var serviceSchema = new mongoose.Schema({
    type  : String,
    city  : [String],
    desc  : String,
    price : String,
    provider:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    }
});

module.exports = mongoose.model("Service",serviceSchema);