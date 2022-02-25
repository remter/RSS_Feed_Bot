import { MessageEmbed } from 'discord.js';

async function PostComicToDiscord(client, channelId, comicDetail) {
  // await client.channels.cache.get(channelId).send({
  //   content: `Title: ${comicDetail.Title}\n Number: ${comicDetail.Num}\n Link: <${comicDetail.Url}>`,
  //   files: [{
  //     attachment: String(comicDetail.Img),
  //     name: 'file.jpg',
  //     description: String(comicDetail.Alt_text),
  //   }],
  // });
  const exampleEmbed = {
    color: 0x0099ff,
    title: `${comicDetail.Num}: ${comicDetail.Title}`,
    url: comicDetail.Url,
    image: {
      url: comicDetail.Img.toString(),
      description: String(comicDetail.Alt_text),
    },
    footer: {
      text: comicDetail.Alt_text,
    },
  };

  await client.channels.cache.get(channelId).send({ embeds: [exampleEmbed] });
}

export default PostComicToDiscord;
