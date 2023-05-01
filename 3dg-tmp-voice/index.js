const { Client, GatewayIntentBits, Collection, ChannelType, PermissionsBitField, time } = require('discord.js');
const fs = require('fs');
const yaml = require('js-yaml');
const auth = require('./assets/auth.json');
const teamData = yaml.load(fs.readFileSync('./assets/teams.yml', 'utf8'));
const channelData = yaml.load(fs.readFileSync('./assets/channel.yml', 'utf8'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
});


var tmpTeams = new Collection();
var teamKeys = [];
var tmpStreamer = new Collection();
var streamerKeys = [];
var tmpSearchPlayers = new Collection();
var searchPlayersKeys = [];
var tmpClanLounge = new Collection();
var clanLoungeKeys = [];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member.user.bot) {
        return;
    } else {
        var channel;
        const everyoneRole = newState.guild.roles.cache.find(role => role.name === '@everyone');
        switch (newState.channelId) {
            case (channelData.team_channel_id):
                console.log(`[${new Date().toLocaleString()}]: Team Channel: Start`);
                const team = getTeam(newState.member);
                if (team === 'none') {
                    break;
                }
                const role = newState.guild.roles.cache.find(role => role.name === team);
                channel = newState.member.guild.channels.create({
                    name: team,
                    type: ChannelType.GuildVoice,
                    parent: (channelData.team_channel_create),
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
                    teamKeys.push(team);
                    tmpTeams.set(team, channel);
                    await newState.member.voice.setChannel(channel).catch();
                }).catch((error) => {
                    console.error(`[${new Date().toLocaleString()}]: ${error}`);
                });
                console.log(`[${new Date().toLocaleString()}]: Team Channel: Success`);
                break;
            case (channelData.live_channel_id):
                console.log(`[${new Date().toLocaleString()}]: Live Channel: Start`);
                channel = newState.member.guild.channels.create({
                    name: newState.member.user.username,
                    type: ChannelType.GuildVoice,
                    parent: (channelData.live.channel_create),
                    permissionOverwrites: [{
                            id: newState.member.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream]
                        },
                        {
                            id: everyoneRole.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel],
                            deny: [PermissionsBitField.Flags.Connect]
                        }
                    ]
                }).then(async(channel) => {
                    streamerKeys.push(newState.member.user.id);
                    tmpStreamer.set(newState.member.user.id, channel);
                    await newState.member.voice.setChannel(channel);
                }).catch((error) => {
                    console.error(`[${new Date().toLocaleString()}]: ${error}`);
                });
                console.log(`[${new Date().toLocaleString()}]: Live Channel: Success`);
                break;
            case (channelData.ss_channel_id):
                console.log(`[${new Date().toLocaleString()}]: Playersearch Channel: Start`);
                var iterator = Math.max(...searchPlayersKeys) === -Infinity ? 1 : Math.max(...searchPlayersKeys) + 1;
                channel = newState.member.guild.channels.create({
                    name: 'Spielersuche ' + iterator,
                    type: ChannelType.GuildVoice,
                    parent: (channelData.ss_channel_create),
                }).then(async(channel) => {
                    searchPlayersKeys.push(iterator);
                    tmpSearchPlayers.set(iterator, channel);
                    await newState.member.voice.setChannel(channel);
                }).catch((error) => {
                    console.error(`[${new Date().toLocaleString()}]: ${error}`);
                });
                console.log(`[${new Date().toLocaleString()}]: Playersearch Channel: Success`);
                break;
            case (channelData.clan_channel_id):
                console.log(`[${new Date().toLocaleString()}]: Clanlounge Channel: Start`);
                var iterator = Math.max(...clanLoungeKeys) === -Infinity ? 1 : Math.max(...clanLoungeKeys) + 1;
                channel = newState.member.guild.channels.create({
                    name: 'Clan-Lounge ' + iterator,
                    type: ChannelType.GuildVoice,
                    parent: (channelData.clan_channel_create),
                }).then(async(channel) => {
                    clanLoungeKeys.push(iterator);
                    tmpClanLounge.set(iterator, channel);
                    await newState.member.voice.setChannel(channel);
                }).catch((error) => {
                    console.error(`[${new Date().toLocaleString()}]: ${error}`);
                });
                console.log(`[${new Date().toLocaleString()}]: Clanlounge Channel: Success`);
                break;
        }
        removeChannels(tmpTeams, teamKeys);
        removeChannels(tmpStreamer, streamerKeys);
        removeChannels(tmpSearchPlayers, searchPlayersKeys);
        removeChannels(tmpClanLounge, clanLoungeKeys);
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

function removeChannels(channels, keys) {
    console.log(`[${new Date().toLocaleString()}]: Remove Channels: Start`);
    keys.forEach(async key => {
        if (channels.get(key).members.size === 0) {
            await channels.get(key).delete().catch();
            channels.delete(key);
            var index = keys.indexOf(key)
            if (index > -1) {
                keys.splice(index, 1);
            }
        }
    });
    console.log(`[${new Date().toLocaleString()}]: Remove Channels: Success`);
}

client.login(auth.token);