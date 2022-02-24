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
    await Database.upsertFeed(feedObj, feedUrl);
    const hasUnread = await Database.hasUnread(feedUrl);
    if (hasUnread) {
      const unread = await Database.getUnreadAndMark(feedUrl);
      return unread;
    }
    return [];
  }
}

export default FeedChecker;
