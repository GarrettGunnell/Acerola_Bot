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

const pieceNamePattern = /\bpawn\b|\bknight\b|\bbishop\b|\brook\b|\bking\b|\bqueen\b/gmi;
const backseatKeywordsPattern = /takes|mate|missed|checkmate|defend|with/gmi;
const chessNotationPattern = /\b[nbkqr]?x?[a-h]{1}[1-8]{1}\b/gmi;


function onMessageHandler(target, context, msg, self) {
    if (self) return;
    console.log(msg);
    console.log(context.username);
    const commandName = msg.trim();

    if (commandName === 'timeout') {
        client.say(target, `/timeout ${context.username} 10`);
        console.log(`* Timing out ${context.username}`);
    }
}


function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}