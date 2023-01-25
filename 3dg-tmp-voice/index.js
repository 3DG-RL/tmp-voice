const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', function(msg) {
    if (msg.content === '/3dg-tmp-voice') {
        msg.reply('Connection established!');
    }
});

client.login('MTA2NzgwMDcwNDY5MDk1NDI3MQ.GEBUwD.h8gXyrH03HSS2G5RaO-_XeaqdK-tk46TVgALCg');