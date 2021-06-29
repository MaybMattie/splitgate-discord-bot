const Discord = require('discord.js')

module.exports = (client) => {
    client.on('message', async message => {
        if (message.author === client.user) return
        const { content, guild, member } = message
        const role = guild.roles.cache.find(role => role.name === 'Moderator')
        if (!member.roles.cache.has(role.id)) return
        const command = content.split(' ')[0]
        if (command !== '!reactions') return
        const args = content.split(' ')
        args.shift()
        if (args.length < 2) {
            let reply = await message.reply('Minimum of 2 Arguments are required')
            setTimeout(() => {
                reply.delete()
            }, 1000 * 2)
        }
        let roles = []
        let emojis = []
        // console.log(args)
        for (let i = 0; i < args.length; i++) {
            if (i % 2 !== 0) { // Emojis
                emojis.push(args[i])
            } else { // Roles
                roles.push(args[i])
            }
        }
        if (roles.length !== emojis.length) {
            let reply = await message.reply('Incorrect syntax! Please use !reactions <@role1> <emoji1>...')
            setTimeout(() => {
                reply.delete()
            }, 1000 * 4)
            return
        }
        let temp = []
        for (let i = 0; i < roles.length; i++) {
            temp.push(`${roles[i]}: ${emojis[i]}\n`)
        }
        let embed = new Discord.MessageEmbed().setTitle('Is this correct?')
            .setDescription(`${temp}`)
        let sentEmbed = await message.channel.send(embed)
        sentEmbed.react('✅')
        sentEmbed.react('❌')
        const filter = (reaction, user) => reaction.emoji.name === '✅' || reaction.emoji.name === '❌' && user.id !== client.user.id
        const collector = sentEmbed.createReactionCollector(filter, { time: 7000 })
        collector.on('collect', async r => {
            if (r.emoji.name === '✅') {
                console.log(r.users.reaction.count)
                if (r.users.cache.find(user => user.id === client.user.id) && r.users.reaction.count === 1) {
                    console.log('found client user id')
                    return
                }
                sentEmbed.delete()
                deleteMessageReply(sentEmbed, "Confirming command...", 4)
            } else if (r.emoji.name === '❌') {
                deleteMessageReply(sentEmbed, "Canceling command...", 4)
                sentEmbed.delete()
            } else {
                sentEmbed.reply("Stop trying to add reactions! I'm lookin at u, kubo")
            }

        })
        collector.on('end', collected => {
            if (collected.size === 0) {
                deleteMessageReply(sentEmbed, "Canceling due to no response...", 3)
            }
        })
    })
}

async function deleteMessageReply(message, reply, time) {
    let sentMessage = await message.channel.send(reply)
    setTimeout(() => {
        sentMessage.delete()
    }, 1000 * time)
}