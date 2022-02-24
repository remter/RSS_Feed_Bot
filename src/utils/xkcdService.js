import axios from 'axios';

export const XKCD_URL = 'https://xkcd.com/';

function xkcdUrlFormat(comicId = null) {
  if (comicId) {
    return `${XKCD_URL}${comicId}/info.0.json`;
  }
  return `${XKCD_URL}/info.0.json`;
}

class xkcdService {
  static getLatestComic() {
    return axios.get(xkcdUrlFormat(null));
  }

  static getComicById(comicId = null) {
    return axios.get(xkcdUrlFormat(comicId));
  }
}

export default xkcdService;
