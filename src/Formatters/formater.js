function Formatter(f) {
  const fOut = {
    Num: f.link.match(/(?<=com\/).*(?=\/)/gi).toString(),
    Title: f.title.toString(),
    Img: f.content.match(/(?<=src=").*\.(jpg|jpeg|png|gif)/gi).toString(),
    Alt_text: f.content.match(/(?<=title=").*.(?=" alt=)/gi).toString(),
    Url: f.link.toString(),
    Date: new Date(Date.UTC),
  };
  return fOut;
}

export default Formatter;
