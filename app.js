// Required Libraries
require('dotenv').config();
const tmi = require("tmi.js");
const reactions = require("./reactions.js");
const commands = require("./commands.js");
const User = require("./db.js");

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
reactions.refreshBlocklist();


// New message arrives
client.on("message", (channel, tags, message, self) => {
  if (self) return;

  // Find existing user or create new user in DB
  User.findOne({ userid: tags['user-id'] }, function(err, user) {
    if (user) {
      user.message.push(message);
      // Pub Point Calculation
      user.pubpoints += 10 * (Math.floor(Math.random() * message.length));
      user.save();
    } else {
      const newUser = new User({
        userid: tags['user-id'],
        username: tags.username,
        displayname: tags['display-name'],
        bartab: 0,
        durrrr: true,
        message: message,
        pubpoints: 0
      });
      newUser.save();
    }
  });

  // Main processing of messages
  commands.process(client, channel, tags, message, self);
  reactions.process(client, channel, tags, message, self);
});

// New Cheer arrives
client.on("cheer", (channel, tags, message, self) => {
  if (self) return;

  // Deduct from Bartab
  User.findOne({ userid: tags['user-id'] }, function(err, user) {
    if (user) {
      user.bartab -= tags.bits;
      user.save();
    }
  })
});
