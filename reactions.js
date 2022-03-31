// Import .env
require('dotenv').config();

// Import tools for calculating odds function
const tools = require('./tools.js');

// Import DB connection
const User = require("./db.js");

// Global Variables
var botSentiment = 1;
var luckSentiment = 1;
var blockList = [];

// Load up Random Facts into an array
const fs = require("fs");
const factFile = "well_actually.txt";
const facts = fs.readFileSync(factFile).toString().split("\n");

// Day of Week multiplier for Thursday
var date = new Date();
var day = date.getDay();
if (day === 4) {
  botSentiment = 1.5;
}

// Main reaction processing goes on here. Exported to app.js.
function processMessage(client, channel, tags, message, self, db) {

  // Magic Word - randomly reiterates  a user's chat message with magic word
  if (tools.calcProbability(.05, botSentiment)) {
    if (!blockList.includes(tags['user-id'])) {
      let messageArray = message.split(" ");
      const messageLength = messageArray.length;
      if (messageLength !== 1 && !messageArray.includes(process.env.MAGIC_WORD)) {
        const indexToReplace = Math.floor(Math.random() * messageLength);
        messageArray[indexToReplace] = process.env.MAGIC_WORD;
        client.say(channel, messageArray.join(" "));
      }
    }
  }

  // Random fact
  if (tools.calcProbability(.005)) {
    client.say(channel, process.env.WELL_ACTUALLY + " " + facts[(Math.floor(Math.random() * facts.length))]);
  }

  // Calling the Urn
  if (tools.calcProbability(.001, luckSentiment)) {
    client.action(channel, "THIS IS THE URN ConcernGold");
  }

  // Bot Sentiment
  if (message === process.env.BOT_NAME + " yes") {
    client.say(channel, "JodiesSmile");
    const botAccelerator = 1.01;
    botSentiment = botSentiment * botAccelerator;
  }

  if (message === process.env.BOT_NAME + " no") {
    client.say(channel, "sadnessCAT");
    const botDecelerator = .99;
    botSentiment = botSentiment * botDecelerator;
  }

  // Luck Sentiment
  if (message.toLowerCase().search(process.env.GOOD_LUCK) > -1 || message.toLowerCase().search(process.env.BLESS) > -1) {
    const luckAccelerator = 1.01;
    luckSentiment = luckSentiment * luckAccelerator;
  }

  // Awoo Fines
  if (message.toLowerCase().search("awoo") > -1 || message.toLowerCase().search("oowa") > -1) {
    const awooCount = (message.toLowerCase().match(/awoo/g) || []).length;
    const oowaCount = (message.toLowerCase().match(/oowa/g) || []).length;
    const tab = (awooCount * 350) + (oowaCount * 35000);
    User.findOne({ userid: tags["user-id"] }, function(err, user) {
      if (user) {
        user.bartab += tab;
        user.save();
      }
    })
  }

}

// Update noDURRRR array
function refreshBlocklist() {
  User.find({ durrrr: false }, function(err, users) {
    blockList = [];
    users.forEach(function(user) {
        blockList.push(user.userid);
    });
  });
}

module.exports = {processMessage, refreshBlocklist};
