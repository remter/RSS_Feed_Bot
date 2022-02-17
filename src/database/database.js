import { fs } from 'fs';
/**
 * Database design considerations
 *
 * 1. Store feeds to reference against for future use.
 * 2. Must be idempotent.
 * 3. Back up data to persistent storage.
 */

const Database = {
  DB_VERSION: 10,
  _db: null,
  db() {
    return this.db;
  },
  _feeds: {},
  get feeds() {
    return this._feeds;
  },

  async init() {
    if (this._db) return this;

    this._feeds = await fs.readFile('../../feeds.json');
    this._db = true;

    return this;
  },

  async syncToFile() {
    fs.writeFile('../../feeds.json', this._feeds);
  },

  async getUnread(feedUrl) {
    return this._feeds[feedUrl].items.filter((i) => !i.isRead);
  },

  // Expects feed of type: https://github.com/rbren/rss-parser/blob/HEAD/test/output/reddit.json
  // Uses feedUrl as unique identifier.
  async upsertFeed(feed) {
    if (!feed.feedUrl) {
      throw new Error('Missing feedUrl!');
    }
    if (!Object.prototype.hasOwnProperty.call(this._feeds, feed.feedUrl)) {
      this._feeds[feed.feedUrl] = feed;
      this._feeds[feed.feedUrl].items.map((i) => ({
        ...i,
        isRead: false,
      }));
    } else {
      // Insert new feed items
      // TODO: handle case if guid does not exist
      feed.items.forEach((i) => {
        if (!this._findItemByGuid(feed.feedUrl, i.guid)) {
          this._feeds[feed.feedUrl].items.push({ ...i, isRead: false });
        }
      });
    }
  },

  async _findItemByGuid(feedUrl, guid) {
    return this._feeds[feedUrl].items.find((i) => i.guid === guid);
  },

  sortItems(feedUrl) {

  },
};

export default Database;
