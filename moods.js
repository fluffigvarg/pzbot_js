var positiveUsers = {};

// track positive user messages via emotes
function processMessage(client, channel, tags, message, self) {
    const positiveEmotes = [
        'prawnzGL',
        'prawnzHype',
        'prawnzTri',
        'prawnzBless',
        'prawnzLUL',
        'prawnz3',
        'prawnzPet',
        'prawnzBoop',
        'prawnzGasm',
        'prawnzWealtheGold',
        'prawnz3Gold',
        'prawnzPOG',
        'prawnzPOGGold',
        'prawnzAwooGold',
        'prawnzYesGold',
        'prawnzGG',
    ];

    const positiveResponses = [
        `/me sniffs ${tags.username}`,
        `/me barks at ${tags.username}`,
        `/me howls at ${tags.username}`,
        `/me curls up next to ${tags.username} and takes a nap`,
        `/me wags tail at ${tags.username}`,
        `/me sits next to ${tags.username} and yawns`,
        `/me tilts his head and stares at ${tags.username}`,
    ];

    messageArray = message.split(" ");

    messageArray.forEach(message => {
        if (positiveEmotes.includes(message)) {
            if (tags.username in positiveUsers) {
                positiveUsers[tags.username] += 1;
            } else {
                positiveUsers[tags.username] = 0;
            }
        }
    });

    if (positiveUsers[tags.username] >= 20) {
        client.say(channel, positiveResponses[Math.floor(Math.random() * positiveResponses.length)]);
        positiveUsers[tags.username] = 0;
    }    
}

module.exports = {processMessage};