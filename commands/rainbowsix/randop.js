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
            name: 'randop',
            memberName: 'randop',
            group: 'rainbowsix',
            description: 'Random Operator',
            aliases: [],
            examples: ['rank 0b95544b-0228-49a7-b338-6d15cfbc3d6a'],
            format: 'randop [side]',
            args: [
                {
                    key: 'side',
                    prompt: 'Please Enter Attacker/Defender:',
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
        var fs = require('fs');
        var files = fs.readdirSync('./assets/operator-icons/')
        /* now files is an Array of the name of the files in the folder and you can pick a random name inside of that array */
        let rndfile = files[Math.floor(Math.random() * files.length)];

        const attachment = new Discord.MessageAttachment(`./assets/operator-icons/${rndfile}`);
        return message.channel.send(message.author, attachment);
    };

};

