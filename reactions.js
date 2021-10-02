// Database connection
const mongoose = require("mongoose");
mongoose.connect(process.env.DB);

// Global Variables
var botSentiment = 1;
var luckSentiment = 1;
var blockList = ["Nightbot", "prawnzbot"];
const bots = ["Nightbot", "prawnzbot"]; // TODO: exclude from fines

// Day of Week multiplier for Thursday
var date = new Date();
var day = date.getDay();
if (day === 5) {
  botSentiment = 2;
}

// Main reaction processing goes on here. Exported to app.js.
module.exports = function reactions(client, channel, tags, message, self, db) {

  // DURRRR
  if (calcProbablity(.05, botSentiment)) {
    refreshBlocklist(db);
    if (blockList.includes(tags.username) === false) {
      let messageArray = message.split(" ");
      const messageLength = messageArray.length;
      const indexToReplace = Math.floor(Math.random() * messageLength);
      messageArray[indexToReplace] = "DURRRR";
      client.say(channel, messageArray.join(" "));
    }
  }

  // Calling the Urn
  if (calcProbablity(.005, luckSentiment)) {
    client.action(channel, "THIS IS THE URN ConcernGold");
  }

  // Bot Sentiment
  if (message === "prawnzbot yes") {
    client.say(channel, "JodiesSmile");
    botSentiment = botSentiment * 1.01;
  }

  if (message === "prawnzbot no") {
    client.say(channel, "sadnessCAT");
    botSentiment = botSentiment * .99;
  }

  // Luck Sentiment
  if (message.toLowerCase().search("prawnzgl") > -1 || message.toLowerCase().search("prawnzbless") > -1) {
    luckSentiment = luckSentiment * 1.01;
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
