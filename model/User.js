const mongoose = require("mongoose");
const moment = require('moment');
const userSchema = mongoose.Schema({
  profile_picture:{
     type:String
  },
  username: {
    type: String,
    require: true,
  },
  ph_number: {
    type: Number,
    require: true,
    unique: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  gender:{
    type: String,
    require: true,
  },
  verificationStatus:{
    type:Boolean,
    default:false
  },
  address_one: {
    type: String,
    require: true,
  },
  address_two: {
    type: String,
  },
  country: {
    type: String,   
    require: true,
  },
  city: {
    type: String,
    require: true,
  },
  zip_code: {
    type: Number,
    require: [true, "Zip Code must require"],
  },
  token:{
    type: Number
  },
  password: {
    type: String,
    require: true,
  },
  devices:{
     type:Array
  },
  createdDate: {
    type: String,
    default:moment().format('MMMM Do YYYY, h:mm:ss a'),
  },
});
module.exports = mongoose.model("User_Data", userSchema);