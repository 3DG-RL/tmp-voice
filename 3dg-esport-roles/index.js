const { Client, GatewayIntentBits } = require('discord.js');
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

client.on('message', message => {
    if (message.content === '!3dg-submit') {
        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                .setCustomId('submit_button')
                .setLabel('Submit')
                .setStyle('PRIMARY')
            );

        message.channel.send('Bitte klicke auf den Submit-Button:', { components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isButton() && interaction.customId === 'submit_button') {
        await interaction.reply('Deine Antwort wurde gespeichert!');
    }
});

client.login(auth.token);