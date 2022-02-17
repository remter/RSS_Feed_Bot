// Followed the setup from digital ocean: https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js

// RSS feed
const RSS_URL = 'https://xkcd.com/rss.xml';

//Initialize parser
let Parser = require('rss-parser');

//Initialize cron
const cron = require('cron');

// Get Discord api
const Discord = require('discord.js');
// Get auth token which is named token. This is my private key.
const auth = require('../auth.json');
// Allows for discord to view messages in chat.
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

// Prefix of messages to look forward to
const prefix = '+';

// Create new Parser
let parser = new Parser();

client.on('messageCreate', (message) => {
  // If message author is a bot Ignore them
  if (message.author.bot) return;
  // If message is not intended for this bot ignore it
  if (!message.content.startsWith(prefix)) return;

  // Cut out prefix
  const commandBody = message.content.slice(prefix.length);
  // Split all spaces into different arguments
  const args = commandBody.split(' ');
  // Remove first element from arg and forces it into lower case
  const command = args.shift().toLowerCase();

  // Checks for commands

  // Test command
  if (command === 'ping') {
    // Calculates time taken for response.
    const timeTaken = Date.now() - message.createdTimestamp;
    message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
  }
  if (command === 'comic') {
    message.reply({
      files: ['https://imgs.xkcd.com/comics/rest_and_fluids.png'],
    });
  }

  // Check feed
  if(command === 'feed'){
    (async () => {
      let file = [];
      
      let feed = await parser.parseURL(RSS_URL);
      feed.items.forEach(item => {
        var res = item.content.match(/(?<=src=").*\.(jpg|jpeg|png|gif)/gi);
        file.push(res);
      });
      file.forEach(file =>{
        message.reply({
          files: file,
        })
      })

    })();

  }
});

client.on('ready', client => {
  client.channels.cache.get('943717767687864341').send('Hello here!');
})


//Create new job which is supposed to run at 20:25:00 everyday.
let feed = new cron.CronJob('00 43 21 * * *', function(){
  (async () => {
    let file = [];
    
    let feed = await parser.parseURL(RSS_URL);
    feed.items.forEach(item => {
      var res = item.content.match(/(?<=src=").*\.(jpg|jpeg|png|gif)/gi);
      file.push(res);
    });
    
    client.channels.cache.get('943717767687864341').send({
      files: file[0],
    })
    

  })();
}, null, true, 'America/Los_Angeles');

//Start sending to discord.
feed.start();

client.login(auth.token);
