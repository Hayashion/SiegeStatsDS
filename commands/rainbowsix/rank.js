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
            format: 'rank [userid]',
            args: [
                {
                    key: 'userid',
                    prompt: 'Please Enter a **userid**:',
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

    async run(message, {userid}) {
        const r6api = new R6API({ email: Email, password: Password });
        const resp = await r6api.getRanks('uplay', `${userid}`, { regionIds: 'all', boardIds: 'pvp_casual' })
        const raw = resp[0].seasons["22"].regions.apac.boards.pvp_casual
        console.log(raw);            
    }
};

