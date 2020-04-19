var mongoose = require("mongoose");

var serviceSchema = new mongoose.Schema({
    type       :String,
    city       :String,
    image      :[String],
    description:String,
    price      :String,
    provider   :{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref :"Vendor"
        },
        username:String
    }
});

module.exports = mongoose.model("Service",serviceSchema);