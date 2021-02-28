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

const pieceNames = /\bpawn\b|\bknight\b|\bbishop\b|\brook\b|\bking\b|\bqueen\b/gmi;
const backseatKeywords = /takes|take|mate|missed|checkmate|defend|with|check|block/gmi;
const chessNotation = /\b[nbkqr]?x?[a-h]{1}[1-8]{1}\b/gmi;

function timeoutUser(target, user) {
    client.say(target, `/timeout ${user} 10`);
    console.log(`* Timing out ${user}`);
}

function backseating(backseatMatches, pieceMatches, chessMoveMatches) {
    if (backseatMatches)
        if (backseatMatches.length >= 2) return true;
    if (chessMoveMatches)
        if (chessMoveMatches.length >= 1) return true;
    if (backseatMatches && pieceMatches)
        if (backseatMatches.length >= 1 && pieceMatches.length >= 1) return true;

    return false;
}


function onMessageHandler(target, context, msg, self) {
    if (self) return;
    const message = msg.trim();
    const user = context.username;
    const backseatMatches = message.match(backseatKeywords);
    const pieceMatches = message.match(pieceNames);
    const chessMoveMatches = message.match(chessNotation);
    
    if (backseating(backseatMatches, pieceMatches, chessMoveMatches))
        timeoutUser(target, user);

    if (message === 'timeout') {
        timeoutUser(target, user);
    }
}


function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}