const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const auth = require('./assets/auth.json');

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

client.on('messageCreate', async msg => {
    if (msg.content === '!3dg-submit') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('submit_button')
                .setLabel('Abschicken')
                .setStyle('Secondary')
            );
        msg.channel.send({ components: [row] })
            .then(console.log('Submit-Button generated!'));
    }
});

client.login(auth.token);