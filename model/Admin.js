const mongoose = require("mongoose");
const moment = require('moment')
const adminSchema = mongoose.Schema({
  admin_name: {
    type: String,
    required: true,
    default: "Admin",
  },
  position: {
    type: String,
    required: true,
  },
  token:{
    type:String,
    default:"0"
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: moment().format('MMMM Do YYYY, h:mm:ss a'),
  },
});
module.exports = mongoose.model("Admin_Data", adminSchema);