// Required Libraries
require('dotenv').config();
const tmi = require("tmi.js");
const reactions = require("./reactions.js");
const commands = require("./commands.js");
const moods = require("./moods.js");
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
    var getCurrentTime = () => new Date().toISOString();
    if (user) {
      user.message.push(getCurrentTime() + " [" + channel + "] " + message);
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
        message: getCurrentTime() + " [" + channel + "] " + message,
        pubpoints: 0
      });
      newUser.save();
    }
  });

  // Main processing of messages
  commands.processMessage(client, channel, tags, message, self);
  reactions.processMessage(client, channel, tags, message, self);
  moods.processMessage(client, channel, tags, message, self);
});

// New Cheer arrives
client.on("cheer", (channel, tags, message) => {
  if (tags.bits > 1) {
    let cheerMessage = `
    prawnzWealtheGold Thanks for the ${tags.bits} bits old bean.
    `;
    client.say(channel, cheerMessage);
  }
  
  // Deduct from Bartab
  User.findOne({ userid: tags['user-id'] }, function(err, user) {
    if (user) {
      user.bartab -= tags.bits;
      user.save();
    }
  })
});

// New subscriber greeting
client.on("subscription", (channel, username, method, message, userstate) => {
  let subscriptionMessage = `
  prawnzAwoo Welcome in to the Pub ${username}! Enjoy the emotes and enjoy the awoos!
  `;
  client.say(channel, subscriptionMessage);
});

// Resub greeting
client.on("resub", (channel, username, months, message, userstate, methods) => {
  let resubMessage = `
  prawnzAwooGold Thank you ${username} for the ${months} months in the Pub! prawnzPet
  `;
  client.say(channel, resubMessage);
});

// Gift subs
client.on("subgift", (channel, username, streakMonths, recipient, methods, userstate) => {
  let senderCount = ~~userstate["msg-param-sender-count"];
  let subgiftMessage = `
  prawnz3Gold Thank you ${username} for the ${senderCount} gift subs! You're too kind! prawnzLove
  `;
  client.say(channel, subgiftMessage)
});