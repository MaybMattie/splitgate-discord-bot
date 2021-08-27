const Discord = require('discord.js')
const tylerID = '627300050673991680'
const mattieID = '204690262977544192'
var monkeySpam = false

module.exports = (client) => {
    client.on('message', async (message) => {
        const { channel, member, content, guild } = message
        if (member.id === client.user.id) return
        if (member.id === mattieID && content.startsWith('!monkey')) {
            if (monkeySpam) {
                let embed = new Discord.MessageEmbed().setTitle("Tyler's Monkey Spam").setDescription('Monkey Spam **OFF**').setColor('#FF0000')
                let sentEmbed = await channel.send(embed)
                setTimeout(() => {
                    sentEmbed.delete()
                }, 1000 * 3)
                message.delete()
            } else {
                let embed = new Discord.MessageEmbed().setTitle("Tyler's Monkey Spam").setDescription('Monkey Spam **ON**').setColor('#00FF00')
                let sentEmbed = await channel.send(embed)
                setTimeout(() => {
                    sentEmbed.delete()
                }, 1000 * 3)
                message.delete()
            }
        }
        if (member.id === tylerID && monkeySpam) {
            message.reply('https://tenor.com/view/monkey-monki-crazy-calm-gif-18390175')
            return
        }
        if (content.toLowerCase().includes('among') && content.toLowerCase().includes('us')) {
            channel.send(`banning ${member} for talking about among us`)
            let nickname = member.nickname
            member.setNickname('AMONG US BAD')
            setTimeout(() => {
                member.setNickname(nickname)
            }, 1000 * 60)
        }
    })
}