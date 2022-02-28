import fs from 'fs-extra';
import Parser from 'rss-parser';
import cron from 'cron';
import Discord from 'discord.js';
import FeedChecker from './feeds/feedchecker.js';

const auth = await fs.readJSON('./auth.json');

// Followed the setup from digital ocean: https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js

// RSS feed
const RSS_URL = 'https://xkcd.com/rss.xml';

// Allows for discord to view messages in chat.
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

// Prefix of messages to look forward to
const prefix = '+';

// Create new Parser
const parser = new Parser();

// sleep timer. useful for spacing out discord messages.
const sleep = (ms) => new Promise((res) => { setTimeout(res, ms); });

// Instantiate Feed Checker/DB
const feedchecker = new FeedChecker();

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

  const botChannel = client.channels.cache.get('943717767687864341');

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
      const res = formatter(feed.items[0]);

      await botChannel.send({
        content: `Title: ${res.Title}\n Number: ${res.Num}\n Link: <${res.Url}>`,
        files: res.Img,
      });
      if (res.Alt_text) {
        await botChannel.send(`${res.Alt_text}`);
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

  // TODO: remove this
  if (command === 'cachefeed') {
    (async () => {
      const newItems = await feedchecker.checkFeed(RSS_URL);
      if (newItems.length === 0) {
        console.debug('no new items');
        return;
      }

      console.debug('newItems', newItems);

      // There should only be one item if checkFeed is regularly scheduled.
      newItems.forEach(async (item) => {
        const formattedComic = formatter(item);
        await botChannel.send({
          content: `New xkcd posted!\n<${formattedComic.Url}>\n**${formattedComic.Title}**\n\`\`\`${formattedComic.Alt_text}\`\`\``,
          files: [{
            attachment: `${formattedComic.Img}`,
            description: `${formattedComic.Alt_text}`,
          }],
        });
        await sleep(500);
      });
    })();
  }
});

client.on('ready', (c) => {
  c.channels.cache.get('943717767687864341').send('Hello!');
});

// xkcd updates MWF in the evening PST. Exact update schedule varies.
// Schedule the job to run MWF, every 30 minutes.
const xkcdJob = new cron.CronJob('00 00,30 * * * 1,3,5', (() => {
  (async () => {
    const newItems = await feedchecker.checkFeed(RSS_URL);
    if (newItems.length === 0) {
      console.debug('no new items');
      return;
    }
    // There should only be one item if checkFeed is regularly scheduled.
    newItems.forEach(async (item) => {
      const formattedComic = formatter(item);
      await client.channels.cache.get('943717767687864341').send({
        content: `New xkcd posted!\n<${formattedComic.Url}>\n**${formattedComic.Title}**\n\`\`\`${formattedComic.Alt_text}\`\`\``,
        files: [{
          attachment: `${formattedComic.Img}`,
          description: `${formattedComic.Alt_text}`,
        }],
      });
    });
    await sleep(500);
  })();
}), null, true, 'America/Los_Angeles');

// Start sending to discord.
xkcdJob.start();

client.login(auth.token);
