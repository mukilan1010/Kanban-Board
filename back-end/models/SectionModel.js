const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  section1: [String],
  section2: [String],
});

module.exports = mongoose.model("Section", sectionSchema);
