// Art
const artArr = [`\n +------+\n |      |\n O      |\n/|${"\\"}     |\n/ ${"\\"}     |\n        |\n==========`,
`\n +------+\n |      |\n O      |\n/|${"\\"}     |\n/       |\n        |\n==========`,
`\n +------+\n |      |\n O      |\n/|${"\\"}     |\n        |\n        |\n==========`,
    `\n +------+\n |      |\n O      |\n/|      |\n        |\n        |\n==========`,
    `\n +------+\n |      |\n O      |\n |      |\n        |\n        |\n==========`,
    `\n +------+\n |      |\n O      |\n        |\n        |\n        |\n==========`,
    `\n +------+\n |      |\n        |\n        |\n        |\n        |\n==========`]
const colorArr = ['#000000', '#c92626', '#c74e22', '#c77722', '#c7b122', '#8dc722', '#4ec722']
const punctuationArr = [' ', '.', ',', '?', '!']
const Discord = require('discord.js')
var lives = 6
var guessedLetters = []
var username
var time

module.exports = (channel, word, letter = null, guess = null, user = null, timestamp = null) => {
    if (letter === null) { // If the game is started for the first time
        wordSpaces = []
        guessedLetters = []
        lives = 6
        // Creates the hidden word
        for (let i = 0; i < word.length; i++) {
            if (punctuationArr.includes(word[i])) {
                wordSpaces.push(punctuationArr[punctuationArr.indexOf(word[i])])
            } else {
                wordSpaces.push('*')
            }
        }
        username = user
        time = timestamp
    } else if (letter !== 'secret') { // If the game is ongoing
        // Checks if the letter being guessed is a letter in the word
        for (let i = 0; i < word.length; i++) {
            if (word[i].toLowerCase() === letter) {
                wordSpaces[i] = letter
            }
        }
        // Removes a life if the letter is not in the word
        if (!word.includes(letter)) {
            lives--
        }
        // If the letter has not been guessed yet, it adds the letter to the guessed letters
        if (!guessedLetters.includes(letter)) {
            guessedLetters.push(letter)
        }
    }
    if (guess) {
        if (guess === word) {
            wordSpaces = word
            var hiddenAnswerString = ("```" + wordSpaces + "```")
        } else {
            lives--
            guessedLetters.push(`'${guess}'`)
            var hiddenAnswerString = ("```" + wordSpaces.join('') + "```")
        }
    } else {
        var hiddenAnswerString = ("```" + wordSpaces.join('') + "```")
    }
    // Converts the guessed letters and hidden words into a string for formating
    var guessedLettersString = "```None guessed```"
    if (guessedLetters.length > 0) {
        guessedLettersString = ("```" + guessedLetters.join('') + "```")
    }

    // Creates and sends the hangman game
    let embed = new Discord.MessageEmbed()
        .setTitle('Hangman')
        .setDescription("```" + artArr[lives] + "```")
        .setColor(colorArr[lives])
        .addFields(
            { name: 'Lives', value: lives, inline: true },
            { name: 'Guessed Letters', value: guessedLettersString, inline: true },
            { name: 'Word', value: hiddenAnswerString, inline: false }
        )
        .setFooter(`Game started by: ${username}`)
        .setTimestamp(time)
    channel.send(embed)

    // If the word has been guessed
    if (!wordSpaces.includes('*')) {
        let embed = new Discord.MessageEmbed().setTitle("YOU WIN!").setColor('#9b22c7')
        channel.send(embed)
        return 'game over'
    }

    // If the game is over
    if (lives === 0) {
        console.log(word)
        let embed = new Discord.MessageEmbed().setTitle('You lose!').setColor('#195991').setDescription(`The word was ${word}`)
        channel.send(embed)
        return 'game over'
    }
}
