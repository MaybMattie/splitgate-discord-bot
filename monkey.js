const Discord = require('discord.js')
const tylerID = '627300050673991680'
const mattieID = '204690262977544192'
var monkeySpam = false

const monkeyGifs = ['https://tenor.com/view/monkey-banana-gif-7848605',
'https://tenor.com/view/leon-side-eyes-leon-ok-and-leon-monkey-eyes-side-eyes-ok-and-gif-22597413',
'https://tenor.com/view/uh-oh-stinky-monkey-gif-15325836',
'https://tenor.com/view/mokey-monkey-monkey-dance-dancing-monkey-monkey-dancing-gif-19821717',
'https://tenor.com/view/monkey-licking-chimp-licking-monkey-camera-licking-camera-monkey-licking-camera-gif-20234087',
'https://tenor.com/view/monkey-dancing-monkey-dance-gif-13114207',
'https://tenor.com/view/monkey-monki-crazy-calm-gif-18390175']

module.exports = (client) => {
    client.on('message', async (message) => {
        const { channel, member, content, guild } = message
        if (member.id === client.user.id) return
        if (member.id === mattieID && content.startsWith('!monkey')) {
            if (monkeySpam) {
                let embed = new Discord.MessageEmbed().setTitle("Tyler's Monkey Spam").setDescription('Monkey Spam **OFF**').setColor('#FF0000')
                let sentEmbed = await channel.send(embed)
                monkeySpam = false
                setTimeout(() => {
                    sentEmbed.delete()
                }, 1000 * 3)
                message.delete()
            } else {
                let embed = new Discord.MessageEmbed().setTitle("Tyler's Monkey Spam").setDescription('Monkey Spam **ON**').setColor('#00FF00')
                let sentEmbed = await channel.send(embed)
                monkeySpam = true
                setTimeout(() => {
                    sentEmbed.delete()
                }, 1000 * 3)
                message.delete()
            }
        }
        if (member.id === tylerID && monkeySpam) {
            let number = Math.floor(monkeyGifs.length() * Math.random())
            message.reply(monkeyGifs[number])
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