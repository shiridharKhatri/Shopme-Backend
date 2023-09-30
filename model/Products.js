const mongoose = require("mongoose");
const moment = require("moment");

const productSchema = mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin_Data",
  },
  name: {
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
  rating: {
    type: Number,
    default: 0,
  },
  review: {
    type: String,
  },
  atStock: {
    type: Boolean,
  },
  stockQuantity: {
    type: Number,
  },
  productImage: {
    type: Array,
  },
  size: [
    {
      type: String,
      default: "N/A",
    },
  ],
  color: [
    {
      type: String,
      default: "N/A",
    },
  ],
  Ram: [
    {
      type: String,
      default: "N/A",
    },
  ],
  Rom: [
    {
      type: String,
      default: "N/A",
    },
  ],

  gender: {
    type: String,
  },
  ram: {
    type: String,
  },
  rom: {
    type: String,
  },

  discount: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  stars: [
    {
      one: {
        type: Number,
        default: 0,
      },
      two: {
        type: Number,
        default: 0,
      },
      three: {
        type: Number,
        default: 0,
      },
      four: {
        type: Number,
        default: 0,
      },
      five: {
        type: Number,
        default: 0,
      },
    },
  ],
  questions: [
    {
      question: String,
      askedBy: Object,
      askedAt: {
        type: String,
        default: moment().format("MMMM Do YYYY, h:mm:ss a"),
      },
      answer: String,
      answerBy: {
        type: String,
        default: "Seller",
      },
      answeredAt: {
        type: String,
        default: moment().format("MMMM Do YYYY, h:mm:ss a"),
      },
    },
  ],
  answers: [
    {
      answer: String,
      answeredTo: String,
      answeredAt: {
        type: String,
        default: moment().format("MMMM Do YYYY, h:mm:ss a"),
      },
    },
  ],
  publistAt: {
    type: String,
    default: moment().format("MMMM Do YYYY, h:mm:ss a"),
  },
});
productSchema.index({ name: "text", description: "text" });
module.exports = mongoose.model("Products_Detail", productSchema);
