const mongoose = require("mongoose");
const moment = require("moment");
const cartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User_Data",
  },
  name: {
    type: String,
  },
  size: {
    type: String,
  },
  color: {
    type: String,
  },
  price: {
    type: Number,
  },
  discount: {
    type: Number,
  },
  ItemId: {
    type: String,
  },
  image: {
    type: Array,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  totalItemQuantity: {
    type: Number,
    default: 1,
  },
  ram: {
    type: String,
  },
  rom: {
    type: String,
  },
  category: {
    type: String,
  },
  addedAt: {
    type: String,
    default: moment().format("MMMM Do YYYY, h:mm:ss a"),
  },
});
module.exports = mongoose.model("user-cart-items", cartSchema);
