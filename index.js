const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const { MessageButton } = require('discord-buttons');
const button = require('discord-buttons');
const fetch = require('node-fetch');
const prefix = process.env.prefix;
const token = process.env.token;
const userSearch = 'https://gameinfo.albiononline.com/api/gameinfo/search?q=';
const player = 'https://gameinfo.albiononline.com/api/gameinfo/players/'
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
let msgVal = null;
let dataVal = null;
button(client);
client.commands = new Discord.Collection();
client.on('warn' , info => info);
client.on('error', console.error);
client.on('ready', () => {
    console.log('run service');
    // client.user.setActivity(`for run this bot you have to us first of statement ${prefix + 'k'}`);
});
client.on('message', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift();
    msgVal = message;
    await getInfo(message, cmd)
})
client.on('clickButton',  button => {
    if (button.id === 'killId') {
        killBoard(dataVal, msgVal);
    } else if (button.id === 'deathsId'){
        deathsBoard(dataVal, msgVal);
    } else {
        message.channel.send('not found kill bord');
    }
});
client.login(token);
async function getInfo(message, cmd) {
    const response = await fetch(userSearch + cmd);
    const data = await response.json();
    dataVal = data;
    let error = false;
    for (let i =0; i < data.players.length; i++) {
        if (data.players && data.players[i].Name === cmd) {
            error = true;
            let res = await fetch(player + data.players[0].Id);
            let subData = await res.json();
            const Embed = {
                color: 0x0099ff,
                title: data.players[0].Name,
                url: 'https://cdn.discordapp.com/icons/913117744252203039/ee766598fbfabd53d486a2e633420e07.webp?size=128',
                author: {
                    name: 'X-RAY stats finder',
                },
                fields: [
                    {
                        name: 'Guild Name:',
                        value: subData.GuildName? subData.GuildName: 'no Guild',
                        inline: true,
                    },
                    {
                        name: 'Alliance Name:',
                        value: subData.AllianceName? subData.AllianceName : 'no Alliance',
                        inline: true,
                    },
                    {
                        name: 'PvP Fame:',
                        value: Format(subData.KillFame),
                        inline: true,
                    },
                    {
                        name: 'Death Fame:',
                        value: Format(subData.DeathFame),
                        inline: true,
                    },
                    {
                        name: 'PvE Fame:',
                        value: Format(subData.LifetimeStatistics.PvE.Total),
                        inline: true,
                    },
                    {
                        name: 'Crafting Fame:',
                        value: Format(subData.LifetimeStatistics.Crafting.Total),
                        inline: true,
                    },
                    {
                        name: 'Gathering total Fame:',
                        value: Format(subData.LifetimeStatistics.Gathering.All.Total),
                        inline: true,
                    },
                    {
                        name: 'Fiber Fame:',
                        value: Format(subData.LifetimeStatistics.Gathering.Fiber.Total),
                        inline: true,
                    },
                    {
                        name: 'Hide Fame:',
                        value: Format(subData.LifetimeStatistics.Gathering.Hide.Total),
                        inline: true,
                    },
                    {
                        name: 'Ore Fame:',
                        value: Format(subData.LifetimeStatistics.Gathering.Ore.Total),
                        inline: true,
                    },
                    {
                        name: 'Rock Fame:',
                        value: Format(subData.LifetimeStatistics.Gathering.Rock.Total),
                        inline: true,
                    },
                    {
                        name: 'Wood Fame:',
                        value: Format(subData.LifetimeStatistics.Gathering.Wood.Total),
                        inline: true,
                    },
                ],
                timestamp: new Date(),
                footer: {
                    text: 'X-RAY FAMILY',
                },
            };
            const killBtn = new MessageButton()
                .setID("killId")
                .setStyle("blurple")
                .setLabel("kill bord");
            const deathBtn = new MessageButton()
                .setID("deathsId")
                .setStyle("blurple")
                .setLabel("death bord");
            message.channel.send({embed: Embed, button: [killBtn, deathBtn]})
            if (i === data.players.length - 1) {
                error = false;
            }
        } else if(!error && i === data.players.length - 1) {
            message.channel.send('character is not find with this name')
        }
    }

}

async function killBoard(data, message) {
    const killRes = await fetch(player + data.players[0].Id + '/kills');
    const kill = await killRes.json();
    const embed = {
        color:0x008000,
        author: {
            name: kill[0].Killer.Name + " killed " + kill[0].Victim.Name,
            icon_url: 'https://i.imgur.com/CeqX0CY.png',
            url: 'https://albiononline.com/en/killboard/kill/' + kill[0].EventId
        },
        // title: assistedBy + itemsDestroyedText,
        description: 'Gaining ' + kill[0].TotalVictimKillFame + ' fame',
        thumbnail: {
            url: (kill[0].Killer.Equipment.MainHand.Type ? 'https://gameinfo.albiononline.com/api/gameinfo/items/' + kill[0].Killer.Equipment.MainHand.Type + '.png' : 'https://albiononline.com/assets/images/killboard/kill__date.png')
        },
        timestamp: kill.TimeStamp,
        fields: [{
            name: "Killer Guild",
            value: (kill[0].Killer.AllianceName ? "[" + kill[0].Killer.AllianceName + "] " : '') + (kill[0].Killer.GuildName ? kill[0].Killer.GuildName : '<none>'),
            inline: true
        },
            {
                name: "Victim Guild",
                value: (kill[0].Victim.AllianceName ? "[" + kill[0].Victim.AllianceName + "] " : '') + (kill[0].Victim.GuildName ? kill[0].Victim.GuildName : '<none>'),
                inline: true
            },
            {
                name: "Killer IP",
                value: kill[0].Killer.AverageItemPower.toFixed(2),
                inline: true
            },
            {
                name: "Victim IP",
                value: kill[0].Victim.AverageItemPower.toFixed(2),
                inline: true
            },
        ],
        footer: {
            text: "Kill #" + kill[0].EventId
        }
    };
    message.channel.send({embed: embed});
}

async function deathsBoard(data, message) {
    const deathsRes = await fetch(player + data.players[0].Id + '/deaths');
    const deaths = await deathsRes.json();
    const embed = {
        color:0x008000,
        author: {
            name: deaths[0].Killer.Name + " killed " + deaths[0].Victim.Name,
            icon_url: 'https://albiononline.com/assets/images/killboard/kill__date.png',
            url: 'https://albiononline.com/en/killboard/kill/' + deaths[0].EventId
        },
        // title: assistedBy + itemsDestroyedText,
        description: 'Gaining ' + deaths[0].TotalVictimKillFame + ' fame',
        thumbnail: {
            url: (deaths[0].Killer.Equipment.MainHand.Type ? 'https://gameinfo.albiononline.com/api/gameinfo/items/' + deaths[0].Killer.Equipment.MainHand.Type + '.png' : 'https://albiononline.com/assets/images/killboard/kill__date.png')
        },
        timestamp: deaths.TimeStamp,
        fields: [{
            name: "Killer Guild",
            value: (deaths[0].Killer.AllianceName ? "[" + deaths[0].Killer.AllianceName + "] " : '') + (deaths[0].Killer.GuildName ? deaths[0].Killer.GuildName : '<none>'),
            inline: true
        },
            {
                name: "Victim Guild",
                value: (deaths[0].Victim.AllianceName ? "[" + deaths[0].Victim.AllianceName + "] " : '') + (deaths[0].Victim.GuildName ? deaths[0].Victim.GuildName : '<none>'),
                inline: true
            },
            {
                name: "Killer IP",
                value: deaths[0].Killer.AverageItemPower.toFixed(2),
                inline: true
            },
            {
                name: "Victim IP",
                value: deaths[0].Victim.AverageItemPower.toFixed(2),
                inline: true
            },
        ],
        footer: {
            text: "Kill #" + deaths[0].EventId
        }
    };
    message.channel.send({embed: embed});
}

Format = function (labelValue) {
    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9

        ? Math.abs(Number(labelValue)) / 1.0e+9 + " B"
        // Six Zeroes for Millions
        : Math.abs(Number(labelValue)) >= 1.0e+6

            ? Math.abs(Number(labelValue)) / 1.0e+6 + " M"
            // Three Zeroes for Thousands
            : Math.abs(Number(labelValue)) >= 1.0e+3

                ? Math.abs(Number(labelValue)) / 1.0e+3 + " K"

                : Math.abs(Number(labelValue));
}
