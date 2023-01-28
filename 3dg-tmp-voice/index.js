const { Client, GatewayIntentBits, Collection, ChannelType, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
});

const teams = [
    '1013903588596121740', //Royal Backflip
    '1014211462513831957', //Next
    '1013933523410890802', //Desire Kappa
    '1013904710199169125', //Desire Delta
    '1014209581720797184', //Underground
    '1014209869563318283', //Spaceground
    '1040717685929021514', //Groundforce
    '1013882511694250064', //Vision
    '1014211191490498643', //Vertigo
    '1014292866195001455', //Equinox
    '1031264077068111923', //Tetris
    '1047204318647943178', //Sunrise
    '1050142820301819977', //Trinity
    '1050853775671300208', //Monarchs
    '1055614374796070912', //Synergy
    '1063054923819921438', //Drifting Hulks
    '1014263903905124392', //E-Sport Team
    'none'
];

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

client.on('messageCreate', function(msg) {
    try {
        if (msg.member.user.bot) {
            return;
        }
        if (msg.member.permissionsIn(msg.channel).has(8)) {
            if (msg.content === '/reset-3dg-tmp-voice') {
                tmpTeams = new Collection();
                teamKeys = [];
                tmpStreamer = new Collection();
                streamerKeys = [];
                tmpSearchPlayers = new Collection();
                searchPlayersKeys = [];
                tmpClanLounge = new Collection();
                clanLoungeKeys = [];
                msg.reply('Der 3DG Voice Channel Bot wurde zurückgesetzt, alle noch vorhandenen Sprachkanäle müssen manuell gelöscht werden!');
            }
        }

    } catch (exception) {}
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member.user.bot) {
        return;
    } else {
        var channel;
        const everyoneRole = newState.guild.roles.cache.find(role => role.name === '@everyone');
        switch (newState.channelId) {
            case '1067923396354113617':
                try {
                    const team = getTeam(newState.member);
                    if (team === 'none') {
                        break;
                    }
                    const role = newState.guild.roles.cache.find(role => role.name === team);
                    channel = newState.member.guild.channels.create({
                        name: team,
                        type: ChannelType.GuildVoice,
                        parent: '1063634429819498570',
                        permissionOverwrites: [{
                                id: role.id,
                                allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream]
                            },
                            {
                                id: everyoneRole.id,
                                deny: [PermissionsBitField.Flags.Connect]
                            }
                        ]
                    }).then((channel) => {
                        teamKeys.push(team);
                        tmpTeams.set(team, channel);
                        newState.member.voice.setChannel(channel).catch();
                    }).catch();
                } catch (exception) {}
                break;
            case '1068259971248168991':
                channel = newState.member.guild.channels.create({
                    name: newState.member.user.username,
                    type: ChannelType.GuildVoice,
                    parent: '1062325305517293588',
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
                }).then((channel) => {
                    streamerKeys.push(newState.member.user.id);
                    tmpStreamer.set(newState.member.user.id, channel);
                    newState.member.voice.setChannel(channel);
                }).catch();
                break;
            case '1068274454557372556':
                var iterator = Math.max(...searchPlayersKeys) === -Infinity ? 1 : Math.max(...searchPlayersKeys) + 1;
                channel = newState.member.guild.channels.create({
                    name: 'Spielersuche ' + iterator,
                    type: ChannelType.GuildVoice,
                    parent: '1068298107432996934',
                }).then((channel) => {
                    searchPlayersKeys.push(iterator);
                    tmpSearchPlayers.set(iterator, channel);
                    newState.member.voice.setChannel(channel);
                }).catch();
                break;
            case '1068277947137544342':
                var iterator = Math.max(...clanLoungeKeys) === -Infinity ? 1 : Math.max(...clanLoungeKeys) + 1;
                channel = newState.member.guild.channels.create({
                    name: 'Clan-Lounge ' + iterator,
                    type: ChannelType.GuildVoice,
                    parent: '1055543864561246218',
                }).then((channel) => {
                    clanLoungeKeys.push(iterator);
                    tmpClanLounge.set(iterator, channel);
                    newState.member.voice.setChannel(channel);
                }).catch();
                break;
        }
        teamKeys.forEach(key => {
            try {
                if (tmpTeams.get(key).members.size === 0) {
                    tmpTeams.get(key).delete();
                    tmpTeams.delete(key);
                    var index = teamKeys.indexOf(key)
                    if (index > -1) {
                        teamKeys.splice(index, 1);
                    }
                }
            } catch (exception) {}
        });
        streamerKeys.forEach(key => {
            try {
                if (tmpStreamer.get(key).members.size === 0) {
                    tmpStreamer.get(key).delete();
                    tmpStreamer.delete(key);
                    var index = streamerKeys.indexOf(key)
                    if (index > -1) {
                        streamerKeys.splice(index, 1);
                    }
                }
            } catch (exception) {}
        });
        searchPlayersKeys.forEach(key => {
            try {
                if (tmpSearchPlayers.get(key).members.size === 0) {
                    tmpSearchPlayers.get(key).delete();
                    tmpSearchPlayers.delete(key);
                    var index = searchPlayersKeys.indexOf(key)
                    if (index > -1) {
                        searchPlayersKeys.splice(index, 1);
                    }
                }
            } catch (exception) {}
        });
        clanLoungeKeys.forEach(key => {
            try {
                if (tmpClanLounge.get(key).members.size === 0) {
                    tmpClanLounge.get(key).delete();
                    tmpClanLounge.delete(key);
                    var index = clanLoungeKeys.indexOf(key)
                    if (index > -1) {
                        clanLoungeKeys.splice(index, 1);
                    }
                }
            } catch (exception) {}
        });
    }
});

client.login('#####');

function getTeam(member) {
    for (let i = 0; i < teams.length; i++) {
        if (member.roles.cache.has(teams[i])) {
            try {
                return member.roles.cache.get(teams[i]).name;
            } catch (exception) {}
        } else if (teams[i] === 'none') {
            return teams[i];
        }
    }
}