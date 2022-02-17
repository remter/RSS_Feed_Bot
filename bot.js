const Discord = require("discord.js");
const auth = require("./auth.json");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});

client.login(auth.token);
