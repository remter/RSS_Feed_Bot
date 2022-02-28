async function PostComicToDiscord(client, channelId, comicDetail) {
  const exampleEmbed = {
    color: 0x0099ff,
    title: `xkcd #${comicDetail.Num}`,
    description: `**${comicDetail.Title}**`,
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
