// Database connection
const mongoose = require("mongoose");
mongoose.connect(process.env.DB);

// Global Variables
var raffleEntries = [];

// Load up Random Facts into an array
const fs = require("fs");
const factFile = "well_actually.txt";
const facts = fs.readFileSync(factFile).toString().split("\n");

// Main function for processing any messages with a command
module.exports = function commands(client, channel, tags, message, self, db) {
  if (message[0] === "!") {
    let messageArray = message.split(" ");
    let commandName = messageArray[0];
    let commandArgs = messageArray.slice(1);

    // Creating and running commands
    switch (commandName.slice(1)) {

      // Opting out of DURRRR
      case "nodurrrr":
        db.findOne({ username: tags.username }, function(err, user) {
          if (user) {
            user.durrrr = false;
            user.save();
          }
        });
        break;

      // Opting into DURRRR
      case "durrrr":
        db.findOne({ username: tags.username }, function(err, user) {
          if (user) {
            user.durrrr = true;
            user.save();
          }
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
        db.findOne({ username: tags.username }, function(err, user) {
          if (user) {
            client.say(channel, "Hey " + tags.username + ", you owe " + user.bartab.toLocaleString() + " bits!");
          }
        });
        break;

      // Check pubpoints via DB
      case "pubpoints":
        db.findOne({ username: tags.username }, function(err, user) {
          if (user) {
            client.say(channel, "Hey " + tags.username + ", you have " + user.pubpoints.toLocaleString() + " Pub Points!");
          }
        });
        break;

      // Enter raffle
      case "enter":
        if (raffleEntries.includes(tags.username) === false) {
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
