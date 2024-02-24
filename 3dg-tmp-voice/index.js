const { Client, GatewayIntentBits, Collection, ChannelType, PermissionsBitField, time } = require('discord.js');
const fs = require('fs');
const yaml = require('js-yaml');
const auth = require('./assets/auth.json');
const teamData = yaml.load(fs.readFileSync('./assets/teams.yml', 'utf8'));
const channelData = yaml.load(fs.readFileSync('./assets/channel.yml', 'utf8'));
let channels = new Collection();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
});

client.on('ready', () => {
    client.user.setActivity('3DG Team Voice');
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member.user.bot) {
        return;
    } else {
        const everyoneRole = newState.guild.roles.cache.find(role => role.name === '@everyone');
        if (newState.channelId === channelData.teamCreate) {
            const team = getTeam(newState.member);
            if (team !== 'none') {
                const role = newState.guild.roles.cache.find(role => role.name === team);
                let name = uniqueIdentifier(team);
                newState.member.guild.channels.create({
                    name: name,
                    type: ChannelType.GuildVoice,
                    parent: (channelData.teamParent),
                    permissionOverwrites: [{
                            id: role.id,
                            allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream]
                        },
                        {
                            id: everyoneRole.id,
                            deny: [PermissionsBitField.Flags.Connect]
                        }
                    ]
                }).then(async(channel) => {
                    channels.set(name, channel);
                    await newState.member.voice.setChannel(channel).catch();
                    console.log(`[${new Date().toLocaleString()}]: Created voice channel: ${name}`)
                }).catch((error) => {
                    console.log(`[${new Date().toLocaleString()}]: Failed to create voice channel ${name}: ${error}`);
                });
            }
        }
        removeChannels();
    }
});

function getTeam(member) {
    for (let i = 0; i < teamData.length; i++) {
        if (member.roles.cache.has(teamData[i])) {
            return member.roles.cache.get(teamData[i]).name;
        } else if (teamData[i] === 'none') {
            return teamData[i];
        }
    }
}

function uniqueIdentifier(team) {
    let [key, i, unique] = [team, 2, false];
    while(!unique) {
        for(let channel of channels) {
            if (channel[0] === key) {
                key = team + '_' + i.toString();
                i++;
                unique = false;
                break;
            }
            unique = true;
        }
        if(channels.size === 0) unique = true;
    }
    return key;
}

async function removeChannels() {
    for (let channel of channels) {
        if (channel[1] && channel[1].members.size === 0) {
            channels.delete(channel[0]);
            await channel[1].delete().then(
                console.log(`[${new Date().toLocaleString()}]: Removed Channel: ${channel[0]}`)
            ).catch((error) => {
                console.error(`[${new Date().toLocaleString()}]: Failed to remove Channel ${channel[0]}: ${error.message}`);
            });
        }
    }
}

process.on('unhandledRejection', (error) => {
    console.log(`[${new Date().toLocaleString()}]: Unhandled Promise Rejection: ${error.message}`);
    restartBot();
});

process.on('uncaughtException', (error) => {
    console.log(`[${new Date().toLocaleString()}]: Uncaught Exception: ${error.message}`);
    restartBot();
});

function restartBot() {
    console.log(`[${new Date().toLocaleString()}]: Restarting bot...`);
    client.destroy();
    channels = new Collection();
    client.login(auth.token);
}

client.login(auth.token);