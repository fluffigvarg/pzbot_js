// Required Libraries
require('dotenv').config();
const tmi = require("tmi.js");
const mongoose = require("mongoose");
const reactions = require("./reactions.js");
const commands = require("./commands.js");

// Database connection
mongoose.connect(process.env.DB);

// Database Models
const userSchema = new mongoose.Schema({
  username: String,
  bartab: Number,
  durrrr: Boolean,
  message: Array,
  pubpoints: Number
});

const User = mongoose.model("User", userSchema);

// Connection to Twitch
const client = new tmi.Client({
  options: {
    debug: true,
    messagesLogLevel: "info"
  },
  connection: {
    reconnect: true,
    secure: true
  },
  identity: {
    username: process.env.USERNAME,
    password: process.env.TOKEN
  },
  channels: process.env.CHANNELS.split(", ")
});

client.connect().catch(console.error);

// New message arrives
client.on("message", (channel, tags, message, self) => {
  if (self) return;

  // Find existing user or create new user in DB
  User.findOne({ username: tags.username }, function(err, user) {
    if (user) {
      user.message.push(message);
      // Pub Point Calculation
      user.pubpoints += 10 * (Math.floor(Math.random() * message.length));
      user.save();
    } else {
      const newUser = new User({
        username: tags.username,
        bartab: 0,
        durrrr: true,
        message: message,
        pubpoints: 0
      });
      newUser.save();
    }
  });

  // Main processing of messages
  commands(client, channel, tags, message, self, User);
  reactions(client, channel, tags, message, self, User);
});

// New Cheer arrives
client.on("cheer", (channel, tags, message, self) => {
  if (self) return;

  // Deduct from Bartab
  User.findOne({ username: tags.username }, function(err, user) {
    if (user) {
      user.bartab -= tags.bits;
      user.save();
    }
  })
});
