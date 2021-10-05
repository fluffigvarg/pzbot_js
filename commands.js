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
function process(client, channel, tags, message, self) {
  if (message[0] === "!") {
    let messageArray = message.split(" ");
    let commandName = messageArray[0].slice(1);
    let commandArgs = messageArray.slice(1);

    // Creating and running commands
    switch (commandName) {

      // Opting in/out of DURRRR
      case "nodurrrr":
      case "durrrr":
        User.findOne({ username: tags.username }, function(err, user) {
          if (user) {
            if (commandName === "nodurrrr") {
              user.durrrr = false;
              client.say(channel, user.username + " is opted out of DURRRR")
            } else {
              user.durrrr = true;
              client.say(channel, user.username + " is opted into DURRRR")
            }
          }
          user.save();
          reactions.refreshBlocklist();
        });
        break;

      // Check DURRRR status
      case "durrrrstatus":
        User.findOne({ username: tags.username }, function(err, user) {
          if (user.durrrr === true) {
            client.say(channel, user.username + " is opted into DURRRR")
          } else {
            client.say(channel, user.username + " is opted out of DURRRR")
          }
          reactions.refreshBlocklist();
        });
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
        User.findOne({ username: tags.username }, function(err, user) {
          if (user) {
            client.say(channel, "Hey " + tags.username + ", you owe " + user.bartab.toLocaleString() + " bits!");
          }
        });
        break;

      // Check pubpoints via DB
      case "pubpoints":
        User.findOne({ username: tags.username }, function(err, user) {
          if (user) {
            client.say(channel, "Hey " + tags.username + ", you have " + user.pubpoints.toLocaleString() + " Pub Points!");
          }
        });
        break;

      // Enter raffle
      case "enter":
        if (!raffleEntries.includes(tags.username)) {
          raffleEntries.push(tags.username);
          client.say(channel, tags.username + ", you're entered!")
        }
        console.log(raffleEntries);
        break;

      // Pick a winner, only mods can do this
      case "winner":
        if (tags.mod) {
          const raffleLength = raffleEntries.length;
          const winnerIndex = Math.floor(Math.random() * raffleLength);
          const winner = raffleEntries[winnerIndex];
          client.say(channel, winner + " has won!");
          raffleEntries = [];
          console.log(raffleEntries);
        }
        break;

      case "wellactually":
        client.say(channel, "prawnzWellActually " + facts[(Math.floor(Math.random() * facts.length))]);
        break;

      default:
        break;

    }
  } else return;
}

module.exports = {process};
