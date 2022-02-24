function JFormatter(j) {
  const fOut = {
    Num: j.,
    Title: f.title,
    Img: f.content.match(/(?<=src=").*\.(jpg|jpeg|png|gif)/gi),
    Alt_text: f.content.match(/(?<=title=").*.(?=" alt=)/gi),
    Url: f.link,
  };
  return fOut;
}

export default JFormatter;
