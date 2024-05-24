const { Rcon } = require('rcon-client')
const cron = require('node-cron')
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    codeBlock,
} = require('discord.js')
const {
    rcon_host,
    rcon_port,
    rcon_password,
    token,
    channel_show,
    channel_error,
    title_embbed,
    client_id,
} = require('./config.json')

const client = new Client({ intents: [GatewayIntentBits.Guilds] })
let message = ''

async function main() {
    try {
        const rcon = new Rcon({
            host: rcon_host,
            port: rcon_port,
            password: rcon_password,
        })
        rcon.on('connect', () => console.log('connected'))
        rcon.on('authenticated', () => console.log('authenticated'))
        rcon.on('end', () => console.log('end'))

        await rcon.connect()

        let responses = await Promise.all([await rcon.send('players')])
        rcon.end()
        return responses
    } catch (error) {
        return false
    }
}

cron.schedule('* */5 * * * *', async function () {
    const channel = await client.channels.fetch(channel_show)
    try {
        message = await channel.messages.fetch(channel.lastMessageId)
    } catch (error) {
        message = undefined
    }

    if ((await main()) === false) {
        if (!message)
            channel.send({
                embeds: [buildEmbbedPlayersOffline()],
            })
        if (message && message.author.id === client_id)
            message.edit({
                embeds: [buildEmbbedPlayersOffline()],
            })
        await client.channels
            .fetch(channel_error)
            .send('Algo de errado não deu certo!')
    } else {
        main().then(async (res) => {
            const players_list = splitPlayers(res[0])
            if (!message)
                channel.send({
                    embeds: [buildEmbbedPlayersOnline(players_list)],
                })
            if (message && message.author.id === client_id)
                message.edit({
                    embeds: [buildEmbbedPlayersOnline(players_list)],
                })
        })
    }
})

client.on('ready', () => {
    console.log('Ready')
})

client.login(token)

const splitPlayers = (response) => response.split('\n')
const showPlayers = (res) => {
    let str = ''
    res.slice(1).map((item) => {
        str = `${str}${item}\n`
    })
    return codeBlock(str)
}

const buildEmbbedPlayersOnline = (response) =>
    new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(title_embbed)
        .setAuthor({
            name: 'HostCarioca',
            iconURL: 'https://i.ibb.co/yXMMBJV/host-Carioca.png',
            url: 'https://discord.js.org',
        })
        .setDescription(':green_circle: **Estamos online!** :green_circle: ')
        .setThumbnail('https://i.ibb.co/yXMMBJV/host-Carioca.png')
        .addFields({
            name: `${response[0]}`,
            value: `${showPlayers(response)}`,
        })
        .setTimestamp()
        .setFooter({
            text: 'HostCarioca',
            iconURL: 'https://i.ibb.co/yXMMBJV/host-Carioca.png',
        })

const buildEmbbedPlayersOffline = () =>
    new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(title_embbed)
        .setAuthor({
            name: 'HostCarioca',
            iconURL: 'https://i.ibb.co/yXMMBJV/host-Carioca.png',
            url: 'https://discord.js.org',
        })
        .setDescription(':red_circle: **Estamos offline!** :red_circle:')
        .setThumbnail('https://i.ibb.co/yXMMBJV/host-Carioca.png')
        .setTimestamp()
        .setFooter({
            text: 'HostCarioca',
            iconURL: 'https://i.ibb.co/yXMMBJV/host-Carioca.png',
        })
