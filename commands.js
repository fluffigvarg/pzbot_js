// Import .env
require('dotenv').config();

// Import refreshBlocklist
const reactions = require("./reactions.js");

// Import DB connection
const User = require("./db.js");

// Global Variables
var raffleEntries = [];

// Load up Random Facts into an array
const fs = require("fs");
const factFile = "well_actually.txt";
const facts = fs.readFileSync(factFile).toString().split("\n");

// Main function for processing any messages with a command
function processMessage(client, channel, tags, message, self) {
  if (message[0] === "!") {
    let messageArray = message.split(" ");
    let commandName = messageArray[0].slice(1);
    let commandArgs = messageArray.slice(1);

    // Creating and running commands
    switch (commandName) {

      // Opting in/out of Magic Word
      case process.env.MAGIC_WORD_NO:
      case "optout":
        User.updateOne({ userid: tags['user-id'] }, { durrrr: false }, function(err, result) {
          reactions.refreshBlocklist();
          checkStatus();
        });
        break;

      case process.env.MAGIC_WORD_YES:
        User.updateOne({ userid: tags['user-id'] }, { durrrr: true }, function(err, result) {
          reactions.refreshBlocklist();
          checkStatus();
        });
        break;

      // Check Magic Word status
      case process.env.MAGIC_WORD_STATUS:
      case "optin":
        function checkStatus() {
          User.findOne({ userid: tags['user-id'] }, function(err, user) {
            if (user.durrrr === true) {
              client.say(channel, user.displayname + " is opted into " + process.env.MAGIC_WORD);
              reactions.refreshBlocklist();
            } else {
              client.say(channel, user.displayname + " is opted out of " + process.env.MAGIC_WORD);
              reactions.refreshBlocklist();
            }
          });
        }
        checkStatus();
        break;

      // Magic 8 Ball
      case "magic8ball":
      case "8ball":
        const responses = [
          "It is certain.",
          "It is decidedly so.",
          "Without a doubt.",
          "Yes - definitely.",
          "You may rely on it.",
          "As I see it, yes.",
          "Most likely.",
          "Outlook good.",
          "Yes.",
          "Signs point to yes.",
          "Reply hazy, try again.",
          "Ask again later.",
          "Better not tell you now.",
          "Cannot predict now.",
          "Concentrate and ask again.",
          "Don't count on it.",
          "My reply is no.",
          "My sources say no.",
          "Outlook not so good.",
          "Very doubtful."
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        client.say(channel, commandArgs.join(" ") + ": " + response);
        break;

      // Check bartab via DB
      case "bartab":
        User.findOne({ userid: tags['user-id'] }, function(err, user) {
          if (user) {
            client.say(channel, "Hey " + user.displayname + ", you owe " + user.bartab.toLocaleString() + " bits!");
          }
        });
        break;

      // Check pubpoints via DB
      case "pubpoints":
        User.findOne({ userid: tags['user-id'] }, function(err, user) {
          if (user) {
            client.say(channel, "Hey " + user.displayname + ", you have " + user.pubpoints.toLocaleString() + " Pub Points!");
          }
        });
        break;

      // Enter raffle
      case "enter":
        if (!raffleEntries.includes(tags['display-name'])) {
          raffleEntries.push(tags['display-name']);
          client.say(channel, tags['display-name'] + ", you're entered!");
        }
        break;

      // Pick a winner, only mods can do this
      case "winner":
        if (tags.mod) {
          const raffleLength = raffleEntries.length;
          const winnerIndex = Math.floor(Math.random() * raffleLength);
          const winner = raffleEntries[winnerIndex];
          client.say(channel, winner + " has won!");
          raffleEntries = [];
        }
        break;

      case "wellactually":
        client.say(channel, process.env.WELL_ACTUALLY + " " + facts[(Math.floor(Math.random() * facts.length))]);
        break;

      default:
        break;

    }
  } else return;
}

module.exports = {processMessage};
