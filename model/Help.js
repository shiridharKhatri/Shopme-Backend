const mongoose = require("mongoose");

const helpSchema = mongoose.Schema({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
});
helpSchema.index({ question: "text", answer: "text" });
module.exports = mongoose.model("Help_question", helpSchema);
