const path = require('path');
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const mongo = require('./mongo')
const suggestionChannel = require('./suggestion-channel');
const config = require('./config.json');
const roleReactions = require('./role-reactions');
const hangman = require('./hangman');

client.on('ready', async () => {
    console.log('The bot is ready!');
    // suggestionChannel(client)
    hangman(client)
    // roleReactions(client)

    // await mongo().then(mongoose => {
    //     try {
    //         console.log('Connected to mongo!')
    //     } finally {
    //         mongoose.connection.close()
    //     }
    // })

    const baseFile = 'command-base.js';
    const commandBase = require(`./commands/${baseFile}`);
    const readCommands = dir => {
        const files = fs.readdirSync(path.join(__dirname, dir))
        for (const file of files) {
            const stat = fs.lstatSync(path.join(__dirname, dir, file));
            if (stat.isDirectory()) {
                readCommands(path.join(dir, file));
            } else if (file !== baseFile) {
                const option = require(path.join(__dirname, dir, file));
                commandBase(client, option);
            }
        }
    }
    readCommands('commands');
});



client.login(process.env.DISCORD_TOKEN);
