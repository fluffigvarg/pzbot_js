// Database connection
const mongoose = require("mongoose");
mongoose.connect(process.env.DB);

// Global Variables
var botSentiment = 1;
var luckSentiment = 1;
var blockList = ["Nightbot", "prawnzbot"];
const bots = ["Nightbot", "prawnzbot"]; // TODO: exclude from fines

// Load up Random Facts into an array
const fs = require("fs");
const factFile = "well_actually.txt";
const facts = fs.readFileSync(factFile).toString().split("\n");

// Day of Week multiplier for Thursday
var date = new Date();
var day = date.getDay();
if (day === 5) {
  botSentiment = 2;
}

// Main reaction processing goes on here. Exported to app.js.
module.exports = function reactions(client, channel, tags, message, self, db) {

  // DURRRR
  if (calcProbablity(1, botSentiment)) {
    refreshBlocklist(db);
    if (blockList.includes(tags.username) === false) {
      let messageArray = message.split(" ");
      const messageLength = messageArray.length;
      if (messageLength !== 1) {
        const indexToReplace = Math.floor(Math.random() * messageLength);
        messageArray[indexToReplace] = "DURRRR";
        client.say(channel, messageArray.join(" "));
      }
    }
  }

  // Random fact
  if (calcProbablity(.001)) {
    client.say(channel, "prawnzWellActually " + facts[(Math.floor(Math.random() * facts.length))]);
  }

  // Calling the Urn
  if (calcProbablity(.0001, luckSentiment)) {
    client.action(channel, "THIS IS THE URN ConcernGold");
  }

  // Bot Sentiment
  if (message === "prawnzbot yes") {
    client.say(channel, "JodiesSmile");
    const botAccelerator = 1.01;
    botSentiment = botSentiment * botAccelerator;
  }

  if (message === "prawnzbot no") {
    client.say(channel, "sadnessCAT");
    const botDecelerator = .99;
    botSentiment = botSentiment * botDecelerator;
  }

  // Luck Sentiment
  if (message.toLowerCase().search("prawnzgl") > -1 || message.toLowerCase().search("prawnzbless") > -1) {
    const luckAccelerator = 1.01;
    luckSentiment = luckSentiment * luckAccelerator;
  }

  // Fines
  if (message.toLowerCase().search("awoo") > -1 || message.toLowerCase().search("oowa") > -1) {
    const awooCount = (message.toLowerCase().match(/awoo/g) || []).length;
    const oowaCount = (message.toLowerCase().match(/oowa/g) || []).length;
    db.findOne({ username: tags.username }, function(err, user) {
      if (user) {
        user.bartab += (awooCount * 350) + (oowaCount * 35000);
        user.save();
      }
    })
  }

}

// Calculate probablity
function calcProbablity(probablity = 1, throttle = 1) {
  const probablityComparison = Math.random();
  if (probablityComparison < (probablity * throttle)) {
    return true;
  } else {
    return false;
  }
}

// Update noDURRRR array
function refreshBlocklist(db) {
  db.find({ durrrr: false }, function(err, users) {
    users.forEach(function(user) {
      if (blockList.includes(user.username) === false) {
        blockList.push(user.username);
      }
    });
  });
}
