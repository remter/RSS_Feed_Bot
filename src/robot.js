// Followed the setup from digital ocean: https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js

// Import File reader
import fs from 'fs-extra';

// Initialize parser
import Parser from 'rss-parser';

// Initialize cron
import cron from 'cron';

// Get Discord api
import Discord from 'discord.js';

// Import formater
import Formatter from './Formatters/formater.js';

// Import axios

// Get auth token which is named token. This is my private key.
const auth = await fs.readJSON('./auth.json');

// Allows for discord to view messages in chat.
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

// Prefix of messages to look forward to
const prefix = '+';

// Create new Parser
const parser = new Parser();

// RSS feed
const RSS_URL = 'https://xkcd.com/rss.xml';

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
  if (command === 'latest') {
    (async () => {
      const feed = await parser.parseURL(RSS_URL);
      // const res = feed.items[0].content.match(/(?<=src=).*\.(jpg|jpeg|png|gif)/gi);"
      const res = Formatter(feed.items[0]);

      await client.channels.cache.get('946163613272535082').send({
        content: `Title: ${res.Title}\n Number: ${res.Num}\n Link: <${res.Url}>`,
        // files: res.Img,
        files: [{
          attachment: String(res.Img),
          name: 'file.jpg',
          description: String(res.Alt_text),
        }],
      });
      if (res.Alt_text) {
        await client.channels.cache.get('946163613272535082').send(`${res.Alt_text}`);
      }
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
        message.channel.send({
          content: `<${f}>`,
          files: f,
        });
      });
    })();
  }
});

client.on('ready', (c) => {
  c.channels.cache.get('946163613272535082').send('Hello here!');
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

    client.channels.cache.get('946163613272535082').send({
      files: file[0],
    });
  })();
}), null, true, 'America/Los_Angeles');

// Start sending to discord.
xkcdJob.start();

client.login(auth.tokenrob);