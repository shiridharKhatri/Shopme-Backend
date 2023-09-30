const mongoose = require("mongoose");
const suggestedSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  color: {
    type: String,
    require: true,
  },
  image: {
    type: String,
    require: true,
  },
});
module.exports = mongoose.model("Suggested_Product", suggestedSchema)