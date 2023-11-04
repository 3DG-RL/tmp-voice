const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder } = require('discord.js');
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
    if (msg.content === '!3dg-help') {
        msg.reply('Inputfelder erstellen:\n**!3dg-inputs**\n\nExel-Tabelle (Esport-LFT):\n**!3dg-lft**');
    } else if (msg.content === '!3dg-inputs') {
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
        const remove = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
                .setCustomId('remove_button')
                .setLabel(dropdown.remove)
                .setStyle('Secondary'))
        msg.channel.send({ components: selectors });
        msg.channel.send({ components: [remove] });
        console.log(`[${new Date().toLocaleString()}]: Selection-UI generated`);
    } else if (msg.content === '!3dg-lft') {
        const workbook = XLSX.utils.book_new();
        fs.readFile('assets/user-data.json', 'utf8', async (err, data) => {
            let headers = ['Spieler']
            for(let key of dropdown.keys) {
                headers.push(dropdown[key].header);
            }
            const sheetData = [headers];
            data = JSON.parse(data);
            Object.keys(data).forEach((player) => {
                const row = [];
                row.push(data[player].player)
                for(let key of dropdown.keys) {
                    row.push(data[player][key].map((item) => item.replace(/"/g, '')).join(', '));
                }
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
            console.log(`[${new Date().toLocaleString()}]: Exel-file generated`);
        });
    }
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isStringSelectMenu()) {
        if (interaction.customId === 'remove_button') {
            fs.readFile('assets/user-data.json', 'utf8', (err, data) => {
                if (err) {
                    console.log(`[${new Date().toLocaleString()}]: Removal failed!`);
                    return false;
                }
                
                let jsonData = JSON.parse(data);
                delete jsonData[interaction.user.id];
                interaction.member.roles.remove(interaction.guild.roles.cache.find((role) => role.name === 'LFT'));
                fs.writeFile('assets/user-data.json', JSON.stringify(jsonData), (err) => {
                    if (err) {
                        console.log(`[${new Date().toLocaleString()}]: Removal failed!`);
                        return false;
                    }

                    interaction.reply({ content: 'Du wurdest aus der Liste entfernt', ephemeral: true});
                    console.log(`[${new Date().toLocaleString()}]: Removed ${interaction.user.id} from list`);
                });
            });
        }
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
        if (err) {
            console.log(`[${new Date().toLocaleString()}]: Update failed!`);
            return false;
        }

        let jsonData = JSON.parse(data);
        if (!jsonData.hasOwnProperty(interaction.user.id)) {
            jsonData[interaction.user.id] = { player: interaction.user.name };

            for(let key of dropdown.keys) {
                jsonData[interaction.user.id][key] = [];
            }
            console.log(`[${new Date().toLocaleString()}]: Added ${interaction.user.id} to the list`);
        }

        jsonData[interaction.user.id][interaction.customId] = interaction.values;

        fs.writeFile('assets/user-data.json', JSON.stringify(jsonData), (err) => {
            if (err) {
                console.log(`[${new Date().toLocaleString()}]: Update failed!`);
                return false;
            }
            interaction.member.roles.add(interaction.guild.roles.cache.find((role) => role.name === 'LFT'));
            console.log(`[${new Date().toLocaleString()}]: Selection of ${interaction.user.id} updated`);
        });
    });
    return true;
}

client.login(auth.token);