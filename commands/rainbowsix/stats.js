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

        const allData = Promise.all([r6api.getStats('uplay', `${UserID}`), r6api.getProgression('uplay', `${UserID}`), r6api.getRanks('uplay', `${UserID}`, { seasonIds:'all', regionIds: 'all', boardIds: 'pvp_casual' })]);
        allData.then(DATA => { // DATA = [valueOfPromise1, valueOfPromise2, ...] 
            const [[GeneralData],[UserProgressData],[SeasonsData]] = DATA;
            const CausalPVPData = GeneralData.pvp.general;
            const OperatorData = GeneralData.pvp.operators;
            const CurrentSeasonID = Object.keys(SeasonsData.seasons).reverse()[0];
            const CurrentSeasonData = SeasonsData.seasons[`${CurrentSeasonID}`];
            const LastSeasonData = SeasonsData.seasons[`${CurrentSeasonID-1}`];

            let color = Math.floor(Math.random() * 16777214) + 1;
            const currentTime = new Date().toISOString();

            console.log(OperatorData);

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
                        "name": "Top Operators",
                        "value": "===================================="
                    },
                    {
                        "name": "Frost",
                        "value": "**Kills:** 234\n**Deaths**: 123\n**Winrate:** 0.87\n**Headshots:** 20.87%",
                        "inline": true
                    },
                    {
                        "name": "Mute",
                        "value": "**Kills:** 234\n**Deaths**: 123\n**Winrate:** 0.87\n**Headshots:** 20.87%",
                        "inline": true
                    },
                    {
                        "name": "Kaid",
                        "value": "**Kills:** 234\n**Deaths**: 123\n**Winrate:** 0.87\n**Headshots:** 20.87%",
                        "inline": true
                    }
                ],
                "footer": {
                    "text": "Last Updated:"
                },
                "timestamp": `${currentTime}`,
                "thumbnail": {
                    "url": `${AvatarURL}`
                }
            })

            return message.channel.send(embed);
        })
            .catch(err => {
                console.log(err);
                return message.channel.send("Something went wrong.");
            })



        // Gets Player Stats
        // response = await r6api.getStats('uplay', `${UserID}`)
        // console.log(response)
        // if (response.length == 0){
        //     return message.channel.send("Something went wrong.");
        // }
        // const generalData = response[0].pvp.general;
        // let color = Math.floor(Math.random() * 16777214) + 1;
        // const currentTime = new Date().toISOString();

        // Gets Player Rank & Level
        // response = await r6api.getProgression('uplay', `${UserID}`);
        // if (response.length == 0){
        //     return message.channel.send("Something went wrong.");
        // }
        // const UserLevel = response[0].level;





    }

};

// async run(message, { username }) {
    //     fetch(apiURL.concat('r6/v1/profile/PC/', `${username}`), fetchConfig)
    //         .then((resp) => resp.json())
    //         .then(function (data) {
    //             // console.log(data)
    //             const status = data.status;
    //             if (status != 200) {
    //                 return message.channel.send(`${status} Failed to find user!`)
    //             }
    //             else {
    //                 const respData = data.data;
    //                 const Metadata = respData.metadata
    //                 const generalStats = respData.stats_general
    //                 let color = Math.floor(Math.random() * 16777214) + 1;

    //                 const embed = new Discord.MessageEmbed({
    //                             "title": Metadata.user,
    //                             // "description": "desc",
    //                             "color": color,
    //                             "fields": [
    //                                 {
    //                                     "name": "Overall Stats",
    //                                     "value": `**Level:** ${Metadata.level} \n**K/D:** ${generalStats.kd}\n**Rank:** ${generalStats.rank.max_mmr}\n**Headshot %:** ${generalStats.headshot_kill_ratio}`
    //                                 },
    //                                 {
    //                                     "name": `Current Season (North Star)`,
    //                                     "value": `**Rank:** Silver III\n**Kills:** 234\n**Deaths**: 123\n**Winrate::** 0.87`,
    //                                     "inline": true
    //                                 },
    //                                 {
    //                                     "name": "Last Season (Crimson Heist)",
    //                                     "value": "**Rank:** Silver II\n**Kills:** 234\n**Deaths**: 123\n**Winrate:** 0.87",
    //                                     "inline": true
    //                                 },
    //                                 {
    //                                     "name": "Top Operators",
    //                                     "value": "===================================="
    //                                 },
    //                                 {
    //                                     "name": "Frost",
    //                                     "value": "**Kills:** 234\n**Deaths**: 123\n**Winrate:** 0.87\n**Headshots:** 20.87%",
    //                                     "inline": true
    //                                 },
    //                                 {
    //                                     "name": "Mute",
    //                                     "value": "**Kills:** 234\n**Deaths**: 123\n**Winrate:** 0.87\n**Headshots:** 20.87%",
    //                                     "inline": true
    //                                 },
    //                                 {
    //                                     "name": "Kaid",
    //                                     "value": "**Kills:** 234\n**Deaths**: 123\n**Winrate:** 0.87\n**Headshots:** 20.87%",
    //                                     "inline": true
    //                                 }
    //                             ],
    //                             "footer": {
    //                                 "text": "Last Updated:"
    //                               },
    //                               "timestamp": `${Metadata.last_updated}`,
    //                             "thumbnail": {
    //                                 "url": `${Metadata.avatar_url}`
    //                             }
    //                     })

    //                 // const embed = new Discord.MessageEmbed()
    //                 //     .setAuthor(`${Metadata.user}`, Metadata.avatar_url)
    //                 //     .setColor(color)
    //                 //     .setThumbnail(Metadata.avatar_url)
    //                 //     .setDescription(`Level: ${Metadata.level}`)

    //                 logger(message.client, `Stats activated by (${message.author.tag} - ID: ${message.author.id})`);

    //                 return message.channel.send(embed);
    //             };
    //         })
    //         .catch(err => console.log(err))


    // }

// if(member == ''){
//     message.channel.messages.fetch({
//         limit: deleteAmount + 1,
//     }).then((messages) => {
//         message.channel.bulkDelete(messages, true).catch(error => console.log(error.stack));
//     });
//     message.channel.send(`Deleting last ${deleteAmount} messages...`).then(msg => {
//         msg.edit(`Successfully deleted ${deleteAmount} messages!`);
//     });

//     logger(message.client, `Purge activated by (${message.author.tag} - ID: ${message.author.id})\n` +
//     `Purged ${deleteAmount} messages by everyone in ${message.channel} (${message.channel.name})`);
// } else {
//     message.channel.messages.fetch({}).then((messages) => {
//         let userMessages = messages.filter(m => m.author.id === member.id).array().slice(0, deleteAmount+1);
//         message.channel.bulkDelete(userMessages, true).catch(error => console.log(error.stack));
//     });
//     message.channel.send(`Deleting last ${deleteAmount} messages by user mentioned: ${member}`).then(msg => {
//         msg.edit(`Successfully deleted ${deleteAmount} messages by ${member}!`);
//     });

//     logger(message.client, `Purge activated by ${message.author} (${message.author.tag} - ID: ${message.author.id})\n` +
//     `Purged ${deleteAmount} messages by ${member} (${member.displayName} - ID: ${member.id}) in ${message.channel} (${message.channel.name})`);
// }