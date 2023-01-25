const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
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

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', function(msg) {
    if (msg.content === '/3dg-tmp-voice') {
        msg.reply('Connection established!');
    } else if (msg.content === '/3dg-team') {
        teams.every(team => {
            if (msg.member.roles.cache.has(team)) {
                msg.reply(msg.member.roles.cache.get(team).name);
                return false;
            } else {
                return true;
            }
        });

    }
});

client.login('#####');