const Discord = require('discord.js')

module.exports = (client) => {
    client.on('message', (message) => {
        const { channel, member, content, guild } = message
        if (member.id === client.user.id) return
        if (content.includes('among') && content.includes('us')) {
            channel.send(`banning ${member} for talking about among us`)
            let nickname = member.nickname
            member.setNickname('AMONG US BAD')
            setTimeout(() => {
                member.setNickname(nickname)
            }, 1000 * 60)
        }
    })
}