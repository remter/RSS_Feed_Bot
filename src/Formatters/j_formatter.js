function JFormatter(j) {
  const fOut = {
    Num: j.num.toString(),
    Title: j.title.toString(),
    Img: j.img.toString(),
    Alt_text: j.alt.toString(),
    Url: `https://xkcd.com/${j.num}/`,
  };
  return fOut;
}

export default JFormatter;
