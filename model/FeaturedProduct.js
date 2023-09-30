const mongoose = require("mongoose");
const moment = require("moment");

const featureSchema = mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin_Data",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  productImage: {
    type: Array,
  },
  color: {
    type: String,
  },
  discount: {
    type: Number,
    default: 0,
  },
  storage:{
     type:Number
  },
  publistAt: {
    type: String,
    default: moment().format("MMMM Do YYYY, h:mm:ss a"),
  },
});
module.exports = mongoose.model("Featured_Products", featureSchema);
