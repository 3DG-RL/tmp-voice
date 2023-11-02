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
                console.log(`[${new Date().toLocaleString()}]: Team Channel: Start`);
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
                            id: channelData.coachRole,
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
                }).catch((error) => {
                    console.error(`[${new Date().toLocaleString()}]: ${error}`);
                });
                console.log(`[${new Date().toLocaleString()}]: Team Channel: Success`);
            }
        }
        removeChannels();
    }
});

function getTeam(member) {
    console.log(`[${new Date().toLocaleString()}]: Get Team: Start`);
    for (let i = 0; i < teamData.length; i++) {
        if (member.roles.cache.has(teamData[i])) {
            console.log(`[${new Date().toLocaleString()}]: Get Team: Success`);
            return member.roles.cache.get(teamData[i]).name;
        } else if (teamData[i] === 'none') {
            console.log(`[${new Date().toLocaleString()}]: Get Team: Success`);
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
    console.log(`[${new Date().toLocaleString()}]: Remove Channels: Start`);
    for (let channel of channels) {
        if (channel[1].members.size === 0) {
            await channel[1].delete().catch();
            channels.delete(channel[0]);
        }
    }
    console.log(`[${new Date().toLocaleString()}]: Remove Channels: Success`);
}

client.login(auth.token);