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
];

const tmpTeams = new Collection();
const teamKeys = [];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', function(msg) {
    if (msg.content === '/3dg-tmp-voice') {
        msg.reply('Connection established!');
    } else if (msg.content === '/3dg-team') {
        msg.reply(getTeam(msg.member));
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member.user.bot) {
        return;
    } else if (oldState.channelId === null) {
        if (newState.channelId === '1067923396354113617') {
            const team = getTeam(newState.member);
            const role = newState.guild.roles.cache.find(role => role.name === team);
            const channel = newState.member.guild.channels.create({
                name: team,
                type: ChannelType.GuildVoice,
                parent: '1063634429819498570',
                permissionOverwrites: [{
                    id: role.id,
                    allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream]
                }],
            }).then((channel) => {
                teamKeys.push(team);
                tmpTeams.set(team, channel);
                newState.member.voice.setChannel(channel);
            }).catch();
        }
    } else {
        teamKeys.forEach(key => {
            if (tmpTeams.get(key).members.size === 0) {
                tmpTeams.get(key).delete();
                tmpTeams.delete(key);
                var index = teamKeys.indexOf(key)
                if (index > -1) {
                    teamKeys.splice(index, 1); // 2nd parameter means remove one item only
                }
            }
        });
    }
});

client.login('#####');

function getTeam(member) {
    for (let i = 0; i < teams.length; i++) {
        if (member.roles.cache.has(teams[i])) {
            return member.roles.cache.get(teams[i]).name;
        }
    }
}