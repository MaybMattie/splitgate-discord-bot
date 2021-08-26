const Discord = require('discord.js')

module.exports = (client) => {
    client.on('message', (message) => {
        const { channel, member, content, guild } = message
        if (member.id === client.member.id) return
        if (content.includes('among') && content.includes('us')) {
            channel.send(`banning ${member} for talking about among us`)
        }
    })
}