// Followed the setup from digital ocean: https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js

// RSS feed
const RSS_URL = 'https://xkcd.com/rss.xml';

// Initialize parser
const Parser = require('rss-parser');

// Initialize cron
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
const parser = new Parser();


function formatter(f) {
  const fOut = {
    Num: f.link.match(/(?<=com\/).*(?=\/)/gi),
    Title: f.title,
    Img: f.content.match(/(?<=src=").*\.(jpg|jpeg|png|gif)/gi),
    Alt_text: f.content.match(/(?<=title=").*.(?=" alt=)/gi),
    Url: f.link,
  };
  return fOut;
}

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
    (async () => {
      const file = [];

      const feed = await parser.parseURL(RSS_URL);

      // const res = feed.items[0].content.match(/(?<=src=).*\.(jpg|jpeg|png|gif)/gi);"
      const res = formatter(feed.items[0]);
      
      message.reply({
        files: file[0],
      });
    })();
  }

  // Check feed
  if (command === 'feed') {
    (async () => {
      const file = [];

      const feed = await parser.parseURL(RSS_URL);
      feed.items.forEach((item) => {
        const res = item.content.match(/(?<=src=").*\.(jpg|jpeg|png|gif)/gi);
        file.push(res);
      });
      file.forEach((f) => {
        message.reply({
          files: f,
        });
      });
    })();
  }
});

client.on('ready', (c) => {
  c.channels.cache.get('943717767687864341').send('Hello here!');
});

// Create new job which is supposed to run at 20:25:00 everyday.
const xkcdJob = new cron.CronJob('00 43 21 * * *', (() => {
  (async () => {
    const file = [];

    const feed = await parser.parseURL(RSS_URL);
    feed.items.forEach((item) => {
      const res = item.content.match(/(?<=src=").*\.(jpg|jpeg|png|gif)/gi);
      file.push(res);
    });

    client.channels.cache.get('943717767687864341').send({
      files: file[0],
    });
  })();
}), null, true, 'America/Los_Angeles');

// Start sending to discord.
xkcdJob.start();

client.login(auth.token);
