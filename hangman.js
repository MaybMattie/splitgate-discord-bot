const channelID = '880254555839942667'
const createChannelID = '880254602358960129'
const Discord = require('discord.js')
const config = require('./config.json')
const hangmanGame = require('./hangmanGame')
const { prefix } = config
var currentGame = false
var word = []
var waiting = false


// Art
const art0 = `\n +------+\n |      |\n        |\n        |\n        |\n        |\n==========`
const art1 = `\n +------+\n |      |\n O      |\n        |\n        |\n        |\n==========`
const art2 = `\n +------+\n |      |\n O      |\n |      |\n        |\n        |\n==========`
const art3 = `\n +------+\n |      |\n O      |\n/|      |\n        |\n        |\n==========`
const art4 = `\n +------+\n |      |\n O      |\n/|${"\\"}     |\n        |\n        |\n==========`
const art5 = `\n +------+\n |      |\n O      |\n/|${"\\"}     |\n/       |\n        |\n==========`
const art6 = `\n +------+\n |      |\n O      |\n/|${"\\"}     |\n/ ${"\\"}     |\n        |\n==========`


module.exports = async (client) => {
    let createChannel = client.guilds.cache.get('880240187534356501').channels.cache.get(createChannelID)

    // Checks messages
    client.on('message', async (message) => {

        // Deconstructs Variables
        const { channel, member, content, guild } = message

        // Checks if the user that sent the message is the client
        if (member.id === client.user.id) return

        // Checks if the channel the message is sent in is the proper channel
        if (channel.id === channelID) {

            // Splits the content into an array, splitting at spaces.
            let command = content.split(' ')

            // Art command
            if (command[0].toLowerCase() === `${prefix}art`) {
                // Sends out the art for the hangman games
                let embed1 = new Discord.MessageEmbed()
                    .setTitle('Hangman Art:')
                    .setColor('#34eb8f')
                    .addFields(
                        { name: 0, value: ("```" + art0 + "```"), inline: true },
                        { name: 1, value: ("```" + art1 + "```"), inline: true },
                        { name: 2, value: ("```" + art2 + "```"), inline: true },
                        { name: 3, value: ("```" + art3 + "```"), inline: true },
                        { name: 4, value: ("```" + art4 + "```"), inline: true },
                        { name: 5, value: ("```" + art5 + "```"), inline: true },
                        { name: 6, value: ("```" + art6 + "```"), inline: true },
                    )
                channel.send(embed1)
            }

            // Checks if the command ~letter is run
            if (command[0].toLowerCase() === `${prefix}letter`) {
                if (!currentGame) {
                    let embed = new Discord.MessageEmbed().setTitle('No active game!')
                    let sentEmbed = await channel.send(embed)
                    setTimeout(() => {
                        sentEmbed.delete()
                    }, 1000 * 2)
                    return
                }
                if (command[1].length > 1) {
                    let embed = new Discord.MessageEmbed().setTitle('More than 1 value!').setDescription('Please only include 1 letter').setColor('#c4270c')
                    let reply = await channel.send(embed)
                    setTimeout(() => {
                        reply.delete()
                    }, 1000 * 3)
                    return
                }

                // Checks if only 1 letter was given
                if (command.length > 2) {
                    let embed = new Discord.MessageEmbed().setTitle('Too many letters!').setDescription('Please only include one letter').setColor('#c4270c')
                    let reply = await channel.send(embed)
                    setTimeout(() => {
                        reply.delete()
                    }, 1000 * 3)
                    return
                }
                // Updates the game with the new letter
                if (hangmanGame(channel, word, command[1].toLowerCase()) === 'game over') {
                    currentGame = false
                }
                message.delete()
            }
            if (command[0] === `${prefix}word`) {
                if (!currentGame) {
                    let embed = new Discord.MessageEmbed().setTitle('No active game!')
                    let sentEmbed = await channel.send(embed)
                    setTimeout(() => {
                        sentEmbed.delete()
                    }, 1000 * 2)
                    return
                }
                let guess = command.slice(1).join(' ')
                if (hangmanGame(channel, word, 'secret', guess) === 'game over') {
                    currentGame = false
                }
                message.delete()
            }
            if (command[0] === `${prefix}resend`) {
                if (!currentGame) {
                    let embed = new Discord.MessageEmbed().setTitle('No active game!')
                    let sentEmbed = await channel.send(embed)
                    setTimeout(() => {
                        sentEmbed.delete()
                    }, 1000 * 2)
                    return
                }
                hangmanGame(channel, word, 'resending')
                message.delete()
            }
        }
    })

    // Formats the create game channel
    createChannelFormat()

    // Checks for updated message reactions
    client.on('messageReactionAdd', async (messageReaction, user) => {
        // Deconstructs variables as well as checks if the right reaction was changed
        if (user.id === client.user.id) return;
        const { emoji, message } = messageReaction
        if (waiting) return
        waiting = true
        if (message.channel.id !== createChannelID) return
        if (emoji.name !== '🆕' && emoji.name !== '❌') return
        if (emoji.name === '❌') {
            if (currentGame) {
                currentGame = false
                let embed = new Discord.MessageEmbed().setTitle('Ending current game...').setColor('#911919')
                createChannel.send(embed)
            } else {
                let embed = new Discord.MessageEmbed().setTitle('No active game...').setColor('#1e967e')
                createChannel.send(embed)
            }
            setTimeout(() => {
                createChannelFormat()
            }, 1000 * 3)
            waiting = false
            return
        }
        if (currentGame) {
            let embed = new Discord.MessageEmbed().setTitle('There is currently an active game...').setColor('#1e967e')
            createChannel.send(embed)
            setTimeout(() => {
                createChannelFormat()
            }, 1000 * 3)
            return
        }
        // Tells the user to type in the word
        let startEmbed = new Discord.MessageEmbed().setTitle('Type in the word(s) to be guessed').setColor('#20f76b')

        // Filter for the message collector
        let filter = m => { return m.author.id !== client.user.id }

        // Sends the message as well as waits for a message
        createChannel.send(startEmbed).then(() => {
            // Checks if the user sends a message and waits 15 seconds to do so.
            createChannel.awaitMessages(filter, { max: 1, time: 1000 * 15 })
                .then(async (collected) => {
                    // Makes the word the content of the message
                    word = collected.first().content
                    // Starts the game
                    currentGame = true
                    let sendChannel = message.guild.channels.cache.get(channelID)
                    let embed = new Discord.MessageEmbed().setTitle('New Game Started').setDescription(`Word is: ${word}`).setColor('#20f76b')
                    let sentEmbed = await createChannel.send(embed)
                    hangmanGame(sendChannel, word, null, null, user.username, sentEmbed.createdTimestamp)
                })
                // If an error happens or nothing is inputed in 15 seconds
                .catch(err => {
                    createChannel.send("Didn't recieve a word (or other error)")
                    console.log(err)
                })
                // Removes the reactions and re-formats the channel.
                .finally(() => {
                    setTimeout(() => {
                        createChannelFormat()
                    }, 1000 * 1)
                    waiting = false
                })
        })
    })

    // Function that formats the create game channel
    async function createChannelFormat() {
        if (createChannel.messages) {
            createChannel.messages.fetch().then(result => {
                createChannel.bulkDelete(result)
            })
            let createEmbed = new Discord.MessageEmbed()
                .setTitle('Start a hangman game')
                .setDescription('React below to start a game, then type the word(s) to be used in the game.')
                .setColor('#20f76b')
            let embed = new Discord.MessageEmbed()
                .setTitle('End current game')
                .setDescription('Click the X below to end any ongoing game.')
                .setColor('#911919')
            let sentEmbedDelete = await createChannel.send(embed)
            let sentEmbed = await createChannel.send(createEmbed)
            sentEmbed.react('🆕')
            sentEmbedDelete.react('❌')
        }

    }

}

