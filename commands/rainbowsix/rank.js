const { Command } = require('discord.js-commando')
const Discord = require("discord.js");
const R6API = require('r6api.js').default;
const logger = require('../../util/logging');
const apiURL = require('../../config.json').apiURL;
const Email = require('../../config.json').UBIemail;
const Password = require('../../config.json').UBIpassword;

module.exports = class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rank',
            memberName: 'rank',
            group: 'rainbowsix',
            description: 'Retrieves Rank, get userid from stats',
            aliases: [],
            examples: ['rank 0b95544b-0228-49a7-b338-6d15cfbc3d6a'],
            format: 'rank [username]',
            args: [
                {
                    key: 'username',
                    prompt: 'Please Enter a **username**:',
                    type: 'string',
                    validate: length => {
                        if (length.length > 2) { return true; } else {
                            return 'Please Enter a Userid Longer Than 2 Characters.';
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

    async run(message, {username}) {
        const r6api = new R6API({ email: Email, password: Password });
        let {0:checker} = await r6api.findByUsername('uplay',`${username}`);
        if (typeof checker == 'undefined'){
            return message.channel.send("Invalid Username");
        }
        const userID = checker.userId;

        let {0:resp} = await r6api.getRanks('uplay', `${userID}`, { regionIds: 'all', boardIds: 'pvp_casual' });
        const raw = resp.seasons["22"].regions.apac.boards.pvp_casual;

        const rank = resp.seasons["22"].regions.apac.boards.pvp_casual.current.name;
        if (rank == 'Unranked'){
            return message.channel.send("No Data Found");
        }
        const updatetime = resp.seasons["22"].regions.apac.boards.pvp_casual.updateTime;
        const icon = resp.seasons["22"].regions.apac.boards.pvp_casual.current.icon;
        const embed = new Discord.MessageEmbed(
            {
                "title": `__**${username}**__`,
                "description": rank,
                "url": `https://r6.tracker.network/profile/pc/${username}`,
                "color": null,
                "timestamp": updatetime,
                "thumbnail": {
                  "url": icon
                }
            
            })

        return message.channel.send(embed);
    };

};

