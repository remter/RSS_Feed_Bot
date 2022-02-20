import Parser from 'rss-parser';
import cron from 'cron';
import Discord from 'discord.js';
// import auth from '../auth.json';
import FeedChecker from './feeds/feedchecker.js';
// Followed the setup from digital ocean: https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js

// RSS feed
const RSS_URL = 'https://xkcd.com/rss.xml';

// Allows for discord to view messages in chat.
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

// Prefix of messages to look forward to
const prefix = '+';

// Create new Parser
const parser = new Parser();

// Instantiate Feed Checker/DB
const feedchecker = new FeedChecker();

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
      feed.items.forEach((item) => {
        const res = item.content.match(/(?<=src=").*\.(jpg|jpeg|png|gif)/gi);
        file.push(res);
      });

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

  // TODO: remove this
  if (command === 'cachefeed') {
    (async () => {
      const newItems = await feedchecker.checkFeed(RSS_URL);
      if (newItems.length === 0) {
        return;
      }
      // There should only be one item
      newItems.forEach((item) => {
        client.channels.cache.get('943717767687864341').send(`New XKCD posted! \nTitle: ${item.title}\nLink: <${item.link}>\nDate: ${item.pubDate}`);
      });
    })();
  }
});

client.on('ready', (c) => {
  c.channels.cache.get('943717767687864341').send('Hello Shin!');
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

client.login('OTQzNjg3MjQwODk3NDI1NDI4.Yg2rOw.oJH5JeBJ7BFxjI4rrO0Yo3Xx_bQ');
