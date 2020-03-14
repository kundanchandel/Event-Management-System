var mongoose = require("mongoose");

var serviceSchema = new mongoose.Schema({
    type  : String,
    city  : [String],
    desc  : String,
    price : String,
    provider : String
});

module.exports = mongoose.model("Service",serviceSchema);