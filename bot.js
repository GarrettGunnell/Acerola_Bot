const tmi = require('tmi.js');
const express = require('express');
const fs = require('fs');
var app = express();

if (process.env.DEPLOYED != 'true') {
    const dotenv = require('dotenv');
    const result = dotenv.config();
    if (result.error)
        throw result.error;
}

const opts = {
    identity: {
        username: process.env.USERNAME,
        password: process.env.OAUTH
    },
    channels: [
        process.env.CHANNEL,
        "Ludwig"
    ]
};

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT);

client.connect();

const pieceNames = /\bpawn[s]?\b|\bknight[s]?\b|\bbishop[s]?\b|\brook[s]?\b|\bking[s]?\b|\bqueen[s]?\b/gmi;
const backseatKeywords = /\btakes\b|\btake\b|\bmate\b|\bmissed\b|\bcheckmate\b|\bdefend\b|\bwith\b|\bcheck\b1|\bblock\b|\bpush\b|\bmove\b|\bpin\b|\bpins\b|\bpinned\b|\blift\b|\bhanging\b/gmi;
const chessNotation = /\b[nbkqr]?x?[a-h]{1}[1-8]{1}\b|\bO-O\b/gmi;
backseatChecking = true;

function timeoutUser(target, user) {
    //client.say(target, `/timeout ${user} 10`);
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

function isMod(context) {
    if (context.mod) return true;
    if (context.badges)
        if ('broadcaster' in context.badges) return true;

    return false;
}


function onMessageHandler(target, context, msg, self) {
    if (self) return;
    const message = msg.trim();
    const user = context.username;
    //console.log(msg);
    //console.log(context);

    if (user === 'acerola_t' && message == 'ping')
        client.say(target, 'pong');

    if (isMod(context)) {
        if (message == '!togglebackseat') {
            backseatChecking = !backseatChecking;
            console.log(`* Toggling backseat removal\n\t- ${backseatChecking}`);
            client.say(target, `${backseatChecking ? 'Enabled' : 'Disabled'} backseat removal`);
        }
    }

    if (backseatChecking) {
        const backseatMatches = message.match(backseatKeywords);
        const pieceMatches = message.match(pieceNames);
        const chessMoveMatches = message.match(chessNotation);
        
        if (backseating(backseatMatches, pieceMatches, chessMoveMatches)) {
            console.log(`${user}: ${message}`);
            timeoutUser(target, user);
            const fileOutput = `\n ${user}: ${message}\n[${backseatMatches}] [${pieceMatches}] [${chessMoveMatches}]`;
            fs.writeFile('./timeouts.txt', fileOutput, { flag: 'a+' }, err => {});
        }
    }
}


function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}