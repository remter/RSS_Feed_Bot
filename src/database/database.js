import fs from 'fs-extra';
/**
 * Database design considerations
 *
 * 1. Store feeds to reference against for future use.
 * 2. Must be idempotent.
 * 3. Back up data to persistent storage.
 */

const Database = {
  FILEPATH: '../../feeds.json',
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

    await fs.ensureFile(this.FILEPATH);

    try {
      this._feeds = await fs.readJSON(this.FILEPATH);
    } catch (e) {
      console.error('Database: Error reading file:', e);
      // Assume that file was newly created; initialise with empty obj
      await fs.writeJSON(this.FILEPATH, this._feeds);
    }
    this._db = true;

    return this;
  },

  async syncToFile() {
    await fs.writeJSON(this.FILEPATH, this._feeds);
  },

  async getLatest(feedUrl) {
    return this._feeds[feedUrl].items[0];
  },

  async getUnreadAndMark(feedUrl) {
    const unread = this._feeds[feedUrl].items.filter((i) => !i.isRead);
    unread.forEach((i) => { i.isRead = true; });
    return unread;
  },

  async hasUnread(feedUrl) {
    return this._feeds[feedUrl].items.some((i) => i.isRead === false);
  },

  // Expects feed of type: https://github.com/rbren/rss-parser/blob/HEAD/test/output/reddit.json
  // Uses feedUrl as unique identifier.
  async upsertFeed(feed, feedUrl) {
    if (!feedUrl) {
      throw new Error('Missing feedUrl!');
    }
    if (!Object.prototype.hasOwnProperty.call(this._feeds, feedUrl)) {
      console.debug('new feed');
      this._feeds[feedUrl] = feed;
      this._feeds[feedUrl].items = this._feeds[feedUrl].items.map((i) => ({
        ...i,
        isRead: false,
      }));
    } else {
      console.debug('feed found, adding items');
      // Insert new feed items
      // TODO: handle case if guid does not exist
      feed.items.forEach((i) => {
        if (!this._findItemByGuid(feedUrl, i.guid)) {
          this._feeds[feedUrl].items.unshift({ ...i, isRead: false });
        }
      });
    }

    this.syncToFile();
  },

  async _findItemByGuid(feedUrl, guid) {
    return this._feeds[feedUrl].items.find((i) => i.guid === guid);
  },

  /**
   * Sorts a given feed by date.
   * WARNING: pubDate is an optional parameter - not all feeds will have this.
   */
  sortItems(feedUrl) {
    this._feeds[feedUrl].items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  },
};

export default Database;
