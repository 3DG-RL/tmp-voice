const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const Discord = require('discord.js');
const XLSX = require('xlsx');
const auth = require('./assets/auth.json');
const dropdown = require('./assets/dropdown.json');
const fs = require("fs");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
});

client.on('ready', () => {
    client.user.setActivity('3DG Esport LFT');
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
    } else if (msg.content === '!3dg-esport') {
        const workbook = XLSX.utils.book_new();
        fs.readFile('assets/user-data.json', 'utf8', async (err, data) => {
            const sheetData = [['Spieler', 'Turniere', 'Alter (Mates)', 'Verfügbarkeit', 'Aktivität', 'Spielmodus']];
            data = JSON.parse(data);
            Object.keys(data).forEach((player) => {
                const row = [];
                row.push(data[player].player)
                row.push(data[player].tournaments.map(item => item.replace(/"/g, '')).join(', '));
                row.push(data[player].age.map(item => item.replace(/"/g, '')).join(', '));
                row.push(data[player].availability.map(item => item.replace(/"/g, '')).join(', '));
                row.push(data[player].activity.map(item => item.replace(/"/g, '')).join(', '));
                row.push(data[player].gamemode.map(item => item.replace(/"/g, '')).join(', '));
                sheetData.push(row);
            });
            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(workbook, worksheet, '3DG-Esport LFT');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            msg.channel.send({
                files: [{
                    attachment: excelBuffer,
                    name: '3DG-Esport-LFT.xlsx'
                }]
            });
        });
    }
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isStringSelectMenu()) {
        return;
    } else {
        if(updateUserData(interaction)) {
            interaction.reply({ content: 'Auswahl aktualisiert: ' + interaction.values, ephemeral: true });
        } else {
            interaction.reply({ content: 'Fehler! Bitte kontaktiere einen Supporter oder Administrator.', ephemeral: true});
        }
    }
});

function updateUserData(interaction) {
    fs.readFile('assets/user-data.json', 'utf8', (err, data) => {
        if (err) return false;
        let jsonData = JSON.parse(data);
        if (!jsonData.hasOwnProperty(interaction.user.id)) {
            jsonData[interaction.user.id] = {
                player: interaction.user.name,
                tournaments: [],
                age: [],
                availability: [],
                activity: [],
                gamemode: []
            };
        }
        jsonData[interaction.user.id][interaction.customId] = interaction.values;
        fs.writeFile('assets/user-data.json', JSON.stringify(jsonData), (err) => {
            if (err) return false;
        });
    });
    return true;
}

client.login(auth.token);