// Followed the setup from digital ocean: https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js

// Import File reader
import fs from 'fs-extra';

// Initialize parser
import Parser from 'rss-parser';

// Initialize cron
import cron from 'cron';

// Get Discord api
import Discord from 'discord.js';

// Import formaters
import Formatter from './Formatters/formater.js';
import JFormatter from './Formatters/j_formatter.js';

// Import Utls
import xkcdService from './utils/xkcdService.js';
import PostComicToDiscord from './utils/postcomictodiscord.js';

// Get auth token which is named token. This is my private key.
const auth = await fs.readJSON('./auth.json');

// Get Settings for bot.
const settings = await fs.readJSON('./settings.json');
const { channelId } = settings;
const { prefix } = settings;
const { RSS_URL } = settings;

// Allows for discord to view messages in chat.
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

// Set up server ID and Channel ID.

// Create new Parser
const parser = new Parser();

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

  // Set up return channel
  const rChannel = message.channel.id;

  // Checks for commands

  // Test command
  if (command === 'ping') {
    // Calculates time taken for response.
    const timeTaken = Date.now() - message.createdTimestamp;
    message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
  }
  // Get latest comic using RSS feed
  if (command === 'latest') {
    (async () => {
      const feed = await parser.parseURL(RSS_URL);
      // const res = feed.items[0].content.match(/(?<=src=).*\.(jpg|jpeg|png|gif)/gi);"
      const res = Formatter(feed.items[0]);

      PostComicToDiscord(client, rChannel, res);
    })();
  }
  // Get comic using AXIOS JSON.
  if (command === 'get-comic') {
    (async () => {
      const comicId = args[0];

      const res = JFormatter((await xkcdService.getComicById(comicId)).data);

      await PostComicToDiscord(client, rChannel, res);
    })();
  }

  // Check feed
  if (command === 'feed') {
    (async () => {
      const feed = await parser.parseURL(RSS_URL);
      feed.items.forEach((item) => {
        const res = Formatter(item);
        PostComicToDiscord(client, rChannel, res);
      });
    })();
  }
});

client.on('ready', (c) => {
  c.channels.cache.get(channelId).send('Hello here!');
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

    client.channels.cache.get(channelId).send({
      files: file[0],
    });
  })();
}), null, true, 'America/Los_Angeles');

// Start sending to discord.
xkcdJob.start();

client.login(auth.tokenrob);
