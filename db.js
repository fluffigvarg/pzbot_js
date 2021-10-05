// Required Libraries
require('dotenv').config();
const mongoose = require("mongoose");

// Database connection
mongoose.connect(process.env.DB);

// Database Models
const userSchema = new mongoose.Schema({
  userid: String,
  username: String,
  displayname: String,
  bartab: Number,
  durrrr: Boolean,
  message: Array,
  pubpoints: Number
});

module.exports = mongoose.model("User", userSchema);
