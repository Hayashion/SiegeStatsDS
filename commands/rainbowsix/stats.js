const { Command } = require('discord.js-commando')
const Discord = require("discord.js");
const R6API = require('r6api.js').default;
const logger = require('../../util/logging');
const apiURL = require('../../config.json').apiURL;
const Email = require('../../config.json').UBIemail;
const Password = require('../../config.json').UBIpassword;
// const fetch = require('node-fetch');

// const fetchConfig = {
//     method: 'GET',
//     headers: {
//         'Content-Type': 'application/json',
//     },
// };

module.exports = class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            memberName: 'stats',
            group: 'rainbowsix',
            description: 'Retrieves Account Statistics For a Given User',
            aliases: [],
            examples: ['stats Avionical'],
            format: 'stats [username]',
            args: [
                {
                    key: 'username',
                    prompt: 'Please Enter a Ubisoft Username:',
                    type: 'string',
                    validate: length => {
                        if (length.length > 2) { return true; } else {
                            return 'Please Enter a Username Longer Than 2 Characters.';
                        }
                    }
                },
            ],
            guildOnly: false,
        })
    }

    hasPermission(message) {
        let PermissionLevel = 1;
        let msglevel = message.client.elevation(message);
        return msglevel >= PermissionLevel;
    }

    async run(message, { username }) {

        const r6api = new R6API({ email: Email, password: Password });

        // Gets Player ID by Username
        let { 0: response } = await r6api.findByUsername('uplay', `${username}`);
        if (typeof response == 'undefined') {
            return message.channel.send("Invalid Username.");
        }
        console.log(response.userId)
        const UserID = response.userId;
        const Username = response.username;
        const AvatarURL = response.avatar['146'];

        const allData = Promise.all([r6api.getStats('uplay', `${UserID}`), r6api.getProgression('uplay', `${UserID}`), r6api.getRanks('uplay', `${UserID}`, { seasonIds: 'all', regionIds: 'all', boardIds: 'pvp_casual' })]);
        allData.then(DATA => { // DATA = [valueOfPromise1, valueOfPromise2, ...] 
            const [[GeneralData], [UserProgressData], [SeasonsData]] = DATA;
            const CausalPVPData = GeneralData.pvp.general;
            const OperatorData = GeneralData.pvp.operators;
            const CurrentSeasonID = Object.keys(SeasonsData.seasons).reverse()[0];
            const CurrentSeasonData = SeasonsData.seasons[`${CurrentSeasonID}`];
            const LastSeasonData = SeasonsData.seasons[`${CurrentSeasonID - 1}`];

            let color = Math.floor(Math.random() * 16777214) + 1;
            const currentTime = new Date().toISOString();

            let OpDataArray = Object.values(OperatorData);
            OpDataArray.sort((a, b) => b.playtime - a.playtime);
            const topOperators = OpDataArray.slice(0,3);

            // console.log(GeneralData.pvp.general.playtime);

            const embed = new Discord.MessageEmbed({
                "title": Username,
                "url": `https://r6.tracker.network/profile/pc/${Username}`,
                "color": color,
                "fields": [
                    {
                        "name": "Overall",
                        "value": `**Level:** ${UserProgressData.level} \n**K/D:** ${CausalPVPData.kd}\n**Rank:** ${CurrentSeasonData.regions.apac.boards.pvp_casual.current.name}\n**Headshot Rate:** ${parseFloat(CausalPVPData.headshots / CausalPVPData.kills * 100).toFixed(2)}%`
                    },
                    {
                        "name": `Casual PVP`,
                        "value": `====================================`,
                        "inline": false
                    },
                    {
                        "name": `Current Season | ${CurrentSeasonData.seasonName}`,
                        "value": `**Rank:** ${CurrentSeasonData.regions.apac.boards.pvp_casual.current.name}\n**K/D:** ${CurrentSeasonData.regions.apac.boards.pvp_casual.kd}\n**Winrate:** ${CurrentSeasonData.regions.apac.boards.pvp_casual.winRate}`,
                        "inline": true
                    },
                    {
                        "name": `Previous Season | ${LastSeasonData.seasonName}`,
                        "value": `**Rank:** ${LastSeasonData.regions.apac.boards.pvp_casual.current.name}\n**K/D:** ${LastSeasonData.regions.apac.boards.pvp_casual.kd}\n**Winrate:** ${LastSeasonData.regions.apac.boards.pvp_casual.winRate}`,
                        "inline": true
                    },
                    {
                        "name": "Top Operators (By Time Played)",
                        "value": "===================================="
                    },
                    {
                        "name": `${topOperators[0].name}`,
                        "value": `**Kills:** ${topOperators[0].kills}\n**Deaths**: ${topOperators[0].deaths}\n**Winrate:** ${topOperators[0].winRate}\n**Headshots:** ${parseFloat(topOperators[0].headshots / topOperators[0].kills * 100).toFixed(2)}%`,
                        "inline": true
                    },
                    {
                        "name": `${topOperators[1].name}`,
                        "value": `**Kills:** ${topOperators[1].kills}\n**Deaths**: ${topOperators[1].deaths}\n**Winrate:** ${topOperators[1].winRate}\n**Headshots:** ${parseFloat(topOperators[1].headshots / topOperators[1].kills * 100).toFixed(2)}%`,
                        "inline": true
                    },
                    {
                        "name": `${topOperators[2].name}`,
                        "value": `**Kills:** ${topOperators[2].kills}\n**Deaths**: ${topOperators[2].deaths}\n**Winrate:** ${topOperators[2].winRate}\n**Headshots:** ${parseFloat(topOperators[2].headshots / topOperators[2].kills * 100).toFixed(2)}%`,
                        "inline": true
                    },
                ],
                "footer": {
                    "text": "Last Updated:"
                },
                "timestamp": `${currentTime}`,
                "thumbnail": {
                    "url": `${AvatarURL}`
                }
            })
            // logger(message.client, `Stats activated by (${message.author.tag} - ID: ${message.author.id})`);
            return message.channel.send(embed);
        })
            .catch(err => {
                console.log(err);
                return message.channel.send("Something went wrong.");
            })
    }

};