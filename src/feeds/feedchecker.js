import Parser from 'rss-parser';
import Database from '../database/database.js';

class FeedChecker {
  constructor() {
    this._db = Database.init();
    this.RSSParser = new Parser();
  }

  /**
   * Checks a given feed for unread items. Mutates array to mark as read.
   * @param {String} feedUrl A valid RSS feed
   * @returns Array of unread RSS items, or empty array.
   */
  async checkFeed(feedUrl) {
    const feedObj = await this.RSSParser.parseURL(feedUrl);
    console.debug('feedurl', feedUrl);
    console.debug('feedobj', feedObj);
    await Database.upsertFeed(feedObj, feedUrl);
    console.debug('database', Database._feeds);
    console.debug('xkcd: items', Database._feeds[feedUrl].items);
    const hasUnread = await Database.hasUnread(feedUrl);
    if (hasUnread) {
      console.debug('found unread');
      const unread = await Database.getUnreadAndMark(feedUrl);
      console.debug('unread', unread);
      return unread;
    }
    return [];
  }
}

export default FeedChecker;
