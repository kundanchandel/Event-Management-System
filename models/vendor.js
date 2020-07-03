var mongoose = require("mongoose");

var vendorSchema = new mongoose.Schema({
    username     :String,
    password     :String,
    email        :String,
    contactNo      :String,
    address     :String,
    description  :String,
    services     :[
           {
                type:mongoose.Schema.Types.ObjectId,
                ref :"Service"
           }
    ]
});

module.exports = mongoose.model("Vendor",vendorSchema);
