require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const { DisTube } = require("distube");
const { YtDlpPlugin } = require("@distube/yt-dlp");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const distube = new DisTube(client, {
    plugins: [new YtDlpPlugin()],
    emitNewSongOnly: true
});

client.once("ready", () => {
    console.log(`${client.user.tag} online!`);
});

client.on("messageCreate", async message => {
    if (message.author.bot) return;

    const args = message.content.split(" ");
    const cmd = args.shift().toLowerCase();

    if (cmd === "!play") {
        const voice = message.member.voice.channel;
        if (!voice)
            return message.reply("Masuk voice channel dulu.");

        const query = args.join(" ");
        if (!query)
            return message.reply("Masukkan judul lagu atau link YouTube.");

        distube.play(voice, query, {
            textChannel: message.channel,
            member: message.member
        });
    }

    if (cmd === "!skip") {
        distube.skip(message);
    }

    if (cmd === "!stop") {
        distube.stop(message);
        message.channel.send("Musik dihentikan.");
    }

    if (cmd === "!pause") {
        distube.pause(message);
        message.channel.send("Musik dijeda.");
    }

    if (cmd === "!resume") {
        distube.resume(message);
        message.channel.send("Musik dilanjutkan.");
    }

    if (cmd === "!queue") {
        const queue = distube.getQueue(message);
        if (!queue) return message.reply("Queue kosong.");
        message.channel.send(
            queue.songs.map((s, i) => `${i + 1}. ${s.name}`).join("\n")
        );
    }
});

distube
.on("playSong", (queue, song) => {
    queue.textChannel.send(`🎵 Memutar **${song.name}**`);
})
.on("addSong", (queue, song) => {
    queue.textChannel.send(`➕ Ditambahkan **${song.name}**`);
})
.on("error", (channel, error) => {
    console.error(error);
    if (channel) channel.send("Terjadi kesalahan saat memutar lagu.");
});

client.login(process.env.TOKEN);
