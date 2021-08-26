const Discord = require('discord.js')
const tylerID = '627300050673991680'

module.exports = (client) => {
    client.on('message', (message) => {
        const { channel, member, content, guild } = message
        if (member.id === client.user.id) return
        if (member.id === tylerID) {
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