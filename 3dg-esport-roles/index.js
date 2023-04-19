const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const auth = require('./assets/auth.json');
const dropdown = require('./assets/dropdown.json');

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
        let selectors = [];
        dropdown.keys.forEach((key) => {
            const selector = dropdown[key];
            let options = [];
            selector.options.forEach((option) => {
                options.push(new StringSelectMenuOptionBuilder()
                    .setLabel(option.label)
                    .setValue(option.value));
            });
            selectors.push(
                new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId(key)
                    .setMinValues(selector.min)
                    .setMaxValues(selector.max)
                    .setPlaceholder(selector.placeholder)
                    .addOptions(options)
                ));
        });
        msg.channel.send({ components: selectors });
    }
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isStringSelectMenu()) {
        return;
    } else {
        //TODO: save information in google docs entry
        console.log(interaction.user);
        console.log(interaction.customId);
        interaction.reply({ content: 'Auswahl aktualisiert: ' + interaction.values, ephemeral: true });
    }
});

client.login(auth.token);