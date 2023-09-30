const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  profile_picture: {
    type: String,
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
  seller_details: [
    {
      seller_government_id_number: {
        type: String,
        require: true,
      },
      seller_Pan_number: {
        type: String,
      },
    },
  ],
  shop_address: [
    {
      country: {
        type: String,
        require: true,
      },
      city: {
        type: String,
        require: true,
      },
      address: {
        type: String,
        require: true,
      },
      zip_code: {
        type: Number,
        require: true,
      },
    },
  ],
  shop_detail: [
    {
      shop_type: {
        type: String,
        required: true,
      },
      shop_registered_number: {
        type: Number,
        required: true,
      },
    },
  ],
  token: {
    type: Number,
  },
  password: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("User_Data", userSchema);
