const Discord = require('discord.js')
const channelID = '856262071447322644'
var testEmbed

module.exports = async (client, arr, message) => {
    console.log(arr)

    // Information deconstructed from the message
    let numSuggestions = arr.length
    const { channel, guild } = message
    let sendChannel = guild.channels.cache.get(channelID)

    // Handles sending the suggestions to the right channel
    if (numSuggestions >= 3) { // If 3 or more suggestions are in the array

        // Gets the index of the 3 highest like-to-dislike ratios from the array
        let highestVal = 0
        let highestIndex = 0
        for (let i = 0; i < arr.length; i++) {
            let likes = arr[i].split('-')[1]
            let dislikes = arr[i].split('-')[2]
            let ratio = getRatio(likes, dislikes)
            if (highestVal === 0 || ratio > highestVal) {
                highestVal = ratio
                highestIndex = i
            }
        }
        let secondVal = 0
        let secondIndex = 0
        for (let i = 0; i < arr.length; i++) {
            if (i === highestIndex) continue
            let likes = arr[i].split('-')[1]
            let dislikes = arr[i].split('-')[2]
            let ratio = getRatio(likes, dislikes)
            if (secondVal === 0 || ratio > secondVal) {
                secondVal = ratio
                secondIndex = i
            }
        }
        let thirdVal = 0
        let thirdIndex = 0
        for (let i = 0; i < arr.length; i++) {
            if (i === highestIndex || i === secondIndex) continue
            let likes = arr[i].split('-')[1]
            let dislikes = arr[i].split('-')[2]
            let ratio = getRatio(likes, dislikes)
            if (thirdVal === 0 || ratio > thirdVal) {
                thirdVal = ratio
                thirdIndex = i
            }
        }

        let topEmbed = await fetchEmbed(arr, highestIndex, channel, "Top Suggestion", '#f54242').then()
        let secondEmbed = await fetchEmbed(arr, secondIndex, channel, "Second Top Suggestion", '#ffffff').then()
        let thirdEmbed = await fetchEmbed(arr, thirdIndex, channel, "Third Top Suggestion", '#428df5').then()
        let numMessages = await amountMessages(sendChannel).then()
        let first = false
        let second = false
        switch (numMessages) {
            case 3:
                sendChannel.messages.fetch().then(messages => {
                    messages.each(message => {
                        if (first) {
                            message.edit('', topEmbed)
                        } else if (second) {
                            message.edit('', secondEmbed)
                            first = true
                        } else {
                            message.edit('', thirdEmbed)
                            second = true
                        }
                    })
                })
                break
            case 2:
                await sendEmptyEmbeds(sendChannel, 1)
                sendChannel.messages.fetch().then(messages => {
                    messages.each(message => {
                        if (first) {
                            message.edit('', topEmbed)
                        } else if (second) {
                            message.edit('', secondEmbed)
                            first = true
                        } else {
                            message.edit('', thirdEmbed)
                            second = true
                        }
                    })
                })
        }

    } else if (numSuggestions === 2) { // If 2 suggestions are in the array

        // Gets the ratio between the 2 suggetsions
        firstRatio = getRatio(arr[0].split('-')[1], arr[0].split('-')[2])
        secondRatio = getRatio(arr[1].split('-')[1], arr[1].split('-')[2])

        // Sets the first suggestion to the top by default, if second suggestion has a higher ratio sets that to first
        let topIndex = 0
        let secIndex = 1
        if (secondRatio > firstRatio) {
            secIndex = 0
            topIndex = 1
        }
        let numMessages = await amountMessages(sendChannel).then()
        let topEmbed = await fetchEmbed(arr, topIndex, channel, "Top Suggestion", '#f54242').then()
        let secondEmbed = await fetchEmbed(arr, secIndex, channel, "Second Top Suggestion", '#ffffff').then()
        let edited = false
        switch (numMessages) {
            case 3:
                await clearChannel(sendChannel, 1)
                sendChannel.messages.fetch().then(messages => {
                    messages.each(message => {
                        edited ? message.edit('', topEmbed) : message.edit('', secondEmbed)
                        edited = true
                    })
                })
                break
            case 2:
                sendChannel.messages.fetch().then(messages => {
                    messages.each(message => {
                        edited ? message.edit('', topEmbed) : message.edit('', secondEmbed)
                        edited = true
                    })
                })
                break
            case 1:
                sendChannel.messages.fetch().then(message => {
                    message.each(message => {
                        message.edit('', topEmbed)
                    })
                })
                let messageID = await sendEmptyEmbeds(sendChannel, 1).then()
                sendChannel.messages.fetch(messageID).then(message => {
                    message.each(message => {
                        if (message.id !== messageID[0]) return
                        message.edit('', secondEmbed)
                    })
                })
                break
        }
    } else { // When there is only 1 suggestion in the array
        let numMessages = await amountMessages(sendChannel).then()
        switch (numMessages) {
            case 3:
                clearChannel(sendChannel, 2)
                sendChannel.messages.fetch().then(message => {
                    message.each(async (message) => {
                        message.edit('', await fetchEmbed(arr, 0, channel, "Top Suggestion", '#f54242').then())
                    })
                })
                break
            case 2:
                clearChannel(sendChannel, 1)
                sendChannel.messages.fetch().then(message => {
                    message.each(async (message) => {
                        message.edit('', await fetchEmbed(arr, 0, channel, "Top Suggestion", '#f54242').then())
                    })
                })
                break
            case 1:
                sendChannel.messages.fetch().then(message => {
                    message.each(async (message) => {
                        message.edit('', await fetchEmbed(arr, 0, channel, "Top Suggestion", '#f54242').then())
                    })
                })
                break
            default:
                let messageID = await sendEmptyEmbeds(sendChannel, 1).then()
                sendChannel.messages.fetch(messageID[0]).then(async message => {
                    message.edit('', await fetchEmbed(arr, 0, channel, "Top Suggestion", '#f54242').then())
                })
                break
        }
    }
}

// Functions used throughout

function clearChannel(channel, numLimit = 0) {
    if (numLimit !== 0) {
        channel.messages.fetch({ limit: numLimit }).then(result => {
            // console.log(numLimit)
            channel.bulkDelete(result)
        })
    } else {
        channel.messages.fetch().then(result => {
            channel.bulkDelete(result)
        })
    }

}


// Calculates the ratio between likes and dislikes
function getRatio(likes, dislikes) {
    return likes - dislikes
}

// Searches for messages with a specific message id in the suggestions channel and sends it to the top suggestions channel
async function fetchEmbed(arr, index, channel, title, color) {

    // Fetches the specific message
    let result = await channel.messages.fetch(arr[index].split('-')[0]).then()
    let embed = result.embeds[0]
    embed
        .setTitle(title)
        .setColor(color)

    // Checks if there are any dislikes on the suggestion
    if (arr[index].split('-')[2] === '0') {
        // If there are 0 dislikes, sets the footer to only show likes
        embed.setFooter(`Likes: ${arr[index].split('-')[1]}`)
    } else {
        // When there are dislikes, adds both likes and dislikes to the footer
        embed.setFooter(`Likes: ${arr[index].split('-')[1]} | Dislikes: ${arr[index].split('-')[2]}`)
    }
    return embed

}

async function sendEmptyEmbeds(channel, num) {
    let arr = []
    for (let i = 0; i < num; i++) {
        let embed = new Discord.MessageEmbed()
        embed.setDescription('test')
        let messageID = await channel.send(embed)
        arr.push(messageID.id)
    }
    return arr
}

async function amountMessages(channel) {
    let messageIDs = []
    let messages = await channel.messages.fetch().then()
    messages.each(async message => {
        messageIDs.push(message.id)
    })
    return messageIDs.length
}