require('dotenv').config();

const { Client, Intents, Constants, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const { REGIONS } = require('./regions.js');
const { PRODUCTS } = require('./products.js')
const WEBHOOK_CHANNEL_ID = '952327350341742722';
var productMap = new Map();

client.on('ready', () => {

    // Register commands
    const commands = client.application.commands;
    
    commands.create({
        name: 'createstockchecker',
        description: 'initalizes stock checker',
        options: [
            {
                name: 'region',
                description: 'region [us, ca, eu]',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'channel',
                description: 'The channel you want to set it in',
                required: false,
                type: Constants.ApplicationCommandOptionTypes.CHANNEL
            },
            {
                name: 'date',
                description: 'The date of the drop e.g March 17',
                required: false,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }

    const { commandName, options } = interaction

    if (commandName == 'createstockchecker') {
        const region = options.getString('region').toUpperCase();
        const date = options.getString('date');
        var channel = options.getChannel('channel');
        if (channel == null) {
            channel = interaction.channel
        }

        const { MessageEmbed } = require('discord.js');
        const stockEmbedd = new MessageEmbed()
            .setColor(REGIONS[region].color)
            .setTitle('https://falcoqb.com/stock/')
            .setURL('https://falcoqb.com/stock/')
            .setAuthor({ name: `${REGIONS[region].name} Stock Information`, iconURL: 'https://cdn.discordapp.com/attachments/918281028710314084/947833724505051146/1024x1024.png', url: 'https://falcoqb.com/stock/' })
            .setThumbnail(REGIONS[region].flagImage)
            .setImage('https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/800px-AMD_Logo.svg.png?20180706160941')
            .setTimestamp()
            .setFooter({ text: `Stock values for AMD Region ${region} Last Updated: `, iconURL: 'https://cdn.discordapp.com/attachments/918281028710314084/947833724505051146/1024x1024.png' });

            if (date != null) {
                stockEmbedd.setDescription(`${date}`)
                interaction.reply({
                    content: `Successfully created embedd in channel **${channel.name}** in region **${region}** with date: **${date}**`,
                    ephemeral: true
                })
            } else {
                interaction.reply({
                    content: `Successfully created embedd in channel **${channel.name}** in region **${region}**`,
                    ephemeral: true
                })
            }
        Object.values(PRODUCTS).forEach(sku => {
            stockEmbedd.addField(sku.name, '0', true)
            productMap.set(REGIONS[region].name + sku.name, '0')
        });
        const msg = await channel.send({ embeds: [stockEmbedd] });
        REGIONS[region].message = msg;
    }
});

client.on('messageCreate', async (message) => {

    if (message.content.toLowerCase().startsWith('{"region"') && message.channelId == WEBHOOK_CHANNEL_ID) {
        parsedMessage = JSON.parse(message.content);
        upperedRegion = parsedMessage.region.toUpperCase();

        if (REGIONS[upperedRegion].message != '' && REGIONS[upperedRegion].message.deleted == false) {
            const newEmbedd = new MessageEmbed()
            .setColor(REGIONS[upperedRegion].color)
            .setTitle('https://falcoqb.com/stock/')
            .setURL('https://falcoqb.com/stock/')
            .setAuthor({ name: `${REGIONS[upperedRegion].name} Stock Information`, iconURL: 'https://cdn.discordapp.com/attachments/918281028710314084/947833724505051146/1024x1024.png', url: 'https://falcoqb.com/stock/' })
            .setThumbnail(REGIONS[upperedRegion].flagImage)
            .setImage('https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/800px-AMD_Logo.svg.png?20180706160941')
            .setTimestamp()
            .setFooter({ text: `Stock values for AMD Region ${upperedRegion} Last Updated: `, iconURL: 'https://cdn.discordapp.com/attachments/918281028710314084/947833724505051146/1024x1024.png' });

        
            Object.values(PRODUCTS).forEach(sku => {
                const stringedValue = parsedMessage[sku.id].toString()
                newEmbedd.addField(sku.name, (stringedValue == '-1') ? productMap.get(REGIONS[upperedRegion].name + sku.name) : stringedValue, true)
                if (stringedValue != '-1') {
                    productMap.set(REGIONS[upperedRegion].name + sku.name, stringedValue)
                }
            });
            REGIONS[upperedRegion].message.edit({embeds:[newEmbedd]});
        }
    }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);