module.exports = {
    commands: ['ping', 'test'],
    permissionError: 'You need admin permissions to run this command',
    callback: (message, arguments, text) => {
        message.channel.send('Pong!');
    },
}