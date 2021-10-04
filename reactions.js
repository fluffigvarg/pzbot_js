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
if (day === 5) {
  botSentiment = 2;
}

// Main reaction processing goes on here. Exported to app.js.
function process(client, channel, tags, message, self, db) {

  // DURRRR
  if (calcProbablity(.02, botSentiment)) {
    if (!blockList.includes(tags.username)) {
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
  if (calcProbablity(.002)) {
    client.say(channel, "prawnzWellActually " + facts[(Math.floor(Math.random() * facts.length))]);
  }

  // Calling the Urn
  if (calcProbablity(.001, luckSentiment)) {
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
    User.findOne({ username: tags.username }, function(err, user) {
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
function refreshBlocklist() {
  blockList = [];
  User.find({ durrrr: false }, function(err, users) {
    users.forEach(function(user) {
      if (!blockList.includes(user.username)) {
        blockList.push(user.username);
      }
    });
  });
}

module.exports = {process, refreshBlocklist};
