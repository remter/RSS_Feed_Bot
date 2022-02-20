import Parser from 'rss-parser';
import Database from '../database/database';

class FeedChecker {
  constructor() {
    this._db = Database.init();
    this.RSSParser = new Parser();
  }

  /**
   *
   * @param {String} feedUrl A valid RSS feed
   * @returns Array of unread RSS items, or empty array.
   */
  async checkFeed(feedUrl) {
    const feedObj = await this.RSSParser.parseURL(feedUrl);
    await this._db.upsertFeed(feedObj);
    const hasUnread = await this._db.hasUnread(feedUrl);
    if (hasUnread) {
      const unread = await this._db.getUnread(feedUrl);
      return unread;
    }
    return [];
  }
}

export default FeedChecker;
