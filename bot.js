//Followed the setup from digital ocean: https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js

//RSS feed
const RSS_URL = 'https://xkcd.com/rss.xml'



//Get Discord api
const Discord = require("discord.js");
//Get auth token which is named token. This is my private key.
const auth = require("./auth.json");
//Allows for discord to view messages in chat.
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});


//Prefix of messages to look forward to
const prefix = "+";


client.on("messageCreate", function(message) { 
    //If message author is a bot Ignore them
    if (message.author.bot) return;
    //If message is not intended for this bot ignore it
    if (!message.content.startsWith(prefix)) return;

    //Cut out prefix
    const commandBody = message.content.slice(prefix.length);
    //Split all spaces into different arguments
    const args = commandBody.split(' ');
    //Remove first element from arg and forces it into lower case
    const command = args.shift().toLowerCase();
    
    //Checks for commands

    //Test command
    if (command === "ping"){
        //Calculates time taken for response.
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);

    }
    if(command === "comic"){
        message.reply({
            files: ['https://imgs.xkcd.com/comics/rest_and_fluids.png']

        })

    }
});                                      



client.login(auth.token);
