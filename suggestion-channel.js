const Discord = require('discord.js')
const { prefix } = require('./config.json')
const topSuggestions = require('./top-suggestions-channel')
const channelID = '856262042984906762'

let recentlyUsed = [] //userId
let usersReacted = [] //userId-messageID
let messageCountReactions = [] //messageID-likeCount-dislikeCount-timestamp
let reactedString = ''
let messageCountString = ''
let paused = false
let command = 'pause'

module.exports = (client) => {
    client.on('messageReactionAdd', async (messageReaction, user) => {

        let likeCount = 0
        let dislikeCount = 0
        // Doesn't execute for the bot's messages
        if (user.id === client.user.id) return

        // Deconstructs variables
        const { count, users, emoji, message } = messageReaction
        const { createdTimestamp } = message

        // Keeps like count and dislike count consistent for each suggestion
        for (const countReactions of messageCountReactions) {
            let messageID = countReactions.split('-')[0]
            if (messageID === message.id) {
                likeCount = countReactions.split('-')[1]
                dislikeCount = countReactions.split('-')[2]
            }
        }


        // Iterates through each user in the reaction and executes specfic code
        users.fetch().then(async userCollection => {
            for (const user of userCollection) {
                // Excludes the bot reaction
                if (user[0] !== client.user.id) {
                    const userID = user[0]
                    // Creates a string to hold information about each user and the message to check if they've reacted before
                    reactedString = `${userID}-${message.id}`
                    if (usersReacted.includes(reactedString)) {
                        // let sentMessage = await message.channel.send(`<@${userID}>, you have already reacted!`)
                        // setTimeout(() => {
                        //     sentMessage.delete()
                        // }, 1000 * 5)
                    } else {
                        // First time user reacted:
                        usersReacted.push(reactedString)
                        // Can be used to check the specific user that reacted (used if devs want to pin suggestions)
                        // if (userID === '204690262977544192' && emoji.name === '👍') {
                        //     message.pin()
                        // }
                        if (emoji.name === '👍') {
                            likeCount = count - 1
                        } else if (emoji.name === '👎') {
                            dislikeCount = count - 1
                        }

                        // Handles storing information about each suggestion
                        // Creates the string to store information about the suggestion
                        messageCountString = `${message.id}-${likeCount}-${dislikeCount}-${createdTimestamp}`
                        // Checks if the array is empty
                        if (messageCountReactions.length) {
                            // Loops through each part in the array
                            for (let i = 0; i < messageCountReactions.length; i++) {
                                messageID = messageCountReactions[i].split('-')[0]
                                // Checks if the messageID of the suggestion has already been in the array
                                if (messageID === message.id) {
                                    // Updates the existing string in the array
                                    let index = i
                                    messageCountReactions[index] = messageCountString
                                    break
                                    // If the message doesn't exist after going through each part of the array the new string gets pushed into it
                                } else if (messageID !== message.id && i === messageCountReactions.length - 1) {
                                    messageCountReactions.push(messageCountString)
                                    break
                                }
                            }
                        } else {
                            // If the array is empty push the first suggestion information
                            messageCountReactions.push(messageCountString)
                        }

                        // Checks how long ago the suggestion was created and removes it from the array if it's greater than 24 hours
                        for (let i = 0; i < messageCountReactions.length; i++) {
                            let timestamp = (messageCountReactions[i].split('-')[3])
                            let twentyFourHours = 1000 * 60 * 60 * 24
                            if (Date.now() - timestamp > twentyFourHours) {
                                messageCountReactions.shift()
                            }
                        }

                        // Sends the information to the top suggestions file 
                        topSuggestions(client, messageCountReactions, message)
                    }

                }
            }
        })
    })

    // Handles turning user text into embeds with the content in the Suggestions channel
    client.on('message', async message => {

        // Deconstructs variables from the message
        const { member, channel, guild, content } = message
        const memberID = member.id

        // Checks to make sure the message is from the Suggestions channel and the user who sent it isn't the bot
        if (channel.id === channelID && member.id !== client.user.id) {
            // Checks if the command "!pause" is being run
            if (content.toLowerCase().startsWith(`${prefix}pause`)) {

                // Checks if the user using the command has the right role
                if (member.roles.cache.find(role => role.name === 'Moderator')) {

                    // Pauses the channel if it's not currently paused
                    if (content.toLowerCase().startsWith(`${prefix}pause`) && paused === false) {
                        message.delete()
                        paused = true
                        let embed = new Discord.MessageEmbed()
                            .setTitle('This channel has been Paused')
                            .setColor('#000000')
                        message.channel.send(embed)
                        return
                    }

                    // Unpauses the channel if it is currently paused
                    if (content.toLowerCase().startsWith(`${prefix}${command}`) && paused) {
                        if (!member.roles.cache.find(role => role.name === 'Moderator')) return
                        message.delete()
                        let embed = new Discord.MessageEmbed()
                            .setTitle('This channel has been Unpaused')
                            .setColor('#000000')
                        message.channel.send(embed)
                        paused = false
                        setTimeout(() => {
                            channel.messages.fetch({ limit: 2 }).then(result => {
                                channel.bulkDelete(result)
                            })
                        }, 1000 * 1)
                        return
                    }
                } else {
                    // Replys saying that you have to have a specific role to use that command
                    message.delete()
                    let sentMessage = await message.reply('You need to be a moderator to use this command!')
                    setTimeout(() => {
                        sentMessage.delete()
                    }, 1000 * 2)
                    return
                }
            }
            // Checks to see if the channel is pasued and deletes the message if it is
            if (paused) {
                message.delete()
                let sentMessage = await message.reply('This channel is paused')
                setTimeout(() => {
                    sentMessage.delete()
                }, 1000 * 3)
                return
            }
            // Checks to see if the user recently typed something to avoid suggestion spam
            if (recentlyUsed.includes(memberID)) {
                message.delete()
                let sentMessage = await message.reply('You can only make a suggestion every hour!')
                // Deletes the reply after 5 seconds
                setTimeout(() => {
                    sentMessage.delete()
                }, 1000 * 5)
                return
            } else {
                // Adds the user the recently used to make sure they can't spam
                recentlyUsed.push(memberID)
                // After a specified time, removes the user from the array
                setTimeout(() => {
                    recentlyUsed = recentlyUsed.filter((id) => {
                        return id !== memberID
                    })
                }, 1000 * 2)
            }

            // Creates a new embed with the user's information, sends it, reacts to it, and deletes the user's message
            const embed = new Discord.MessageEmbed()
                .setAuthor(member.displayName, member.user.displayAvatarURL())
                .setDescription(content)
            Math.random() > 0.5 ? embed.setColor('#f54242') : embed.setColor('#428df5')
            let sentEmbed = await channel.send(embed)
            sentEmbed.react('👍')
            sentEmbed.react('👎')
            message.delete()
            return;
        }
    })
}