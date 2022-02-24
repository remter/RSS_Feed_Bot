function Formatter(f) {
  const fOut = {
    Num: f.link.match(/(?<=com\/).*(?=\/)/gi),
    Title: f.title,
    Img: f.content.match(/(?<=src=").*\.(jpg|jpeg|png|gif)/gi),
    Alt_text: f.content.match(/(?<=title=").*.(?=" alt=)/gi),
    Url: f.link,
  };
  return fOut;
}

export default Formatter;
