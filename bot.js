const tmi = require('tmi.js');
const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error)
    throw result.error;

const opts = {
    identity: {
        username: process.env.USERNAME,
        password: process.env.OAUTH
    },
    channels: [
        process.env.CHANNEL
    ]
};

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

function onMessageHandler(target, context, msg, self) {
    if (self) return;
    const commandName = msg.trim();

    if (commandName === '!dice') {
        const num = rollDice();
        client.say(target, `You rolled a ${num}`);
        console.log(`* Executed ${commandName} command`);
    } else {
        console.log(`* Unknown command ${commandName}`);
    }
}

function rollDice() {
    const sides = 6;
    return Math.floor(Math.random() * sides) + 1;
}

function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}