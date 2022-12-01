import { app } from 'electron';
import { Database } from 'sqlite3';
const path = require('node:path');

let db: Database;

export function initDatabase(appPath: string) {
  const dbPath = path.resolve(appPath, 'data.sqlite3');

  db = new Database(dbPath);

  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS tweet (id TEXT PRIMARY KEY, data JSON, updated_at INTEGER)');
    db.run('CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, data JSON, updated_at INTEGER)');
  });
}

export function closeDatabase() {
  db.close();
}

export async function addTweet(id: string, data: any) {
  const isTweetExist = await new Promise((resolve, reject) => {
    db.get('SELECT EXISTS(SELECT 1 FROM tweet WHERE id = ?);', [id], function (err, row) {
      if (err) {
        reject(err);
        return;
      }

      resolve((Boolean)(Object.values(row)[0]));
    });
  });

  const jsonData = JSON.stringify(data);
  const updatedAt = Math.floor(Date.now() / 1000);
  if (isTweetExist) {
    await new Promise((resolve, reject) => {
      db.run('UPDATE tweet SET data = ?, updated_at = ? WHERE id = ?;', [jsonData, updatedAt, id], function (err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  } else {
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO tweet (id, data, updated_at) VALUES (?, ?, ?);', [id, jsonData, updatedAt], function (err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  }
}

export async function addMedia(id: string, data: any) {
  const isMediaExist = await new Promise((resolve, reject) => {
    db.get('SELECT EXISTS(SELECT 1 FROM media WHERE id = ?);', [id], function (err, row) {
      if (err) {
        reject(err);
        return;
      }

      resolve((Boolean)(Object.values(row)[0]));
    });
  });

  const jsonData = JSON.stringify(data);
  const updatedAt = Math.floor(Date.now() / 1000);
  if (isMediaExist) {
    await new Promise((resolve, reject) => {
      db.run('UPDATE media SET data = ?, updated_at = ? WHERE id = ?;', [jsonData, updatedAt, id], function (err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  } else {
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO media (id, data, updated_at) VALUES (?, ?, ?);', [id, jsonData, updatedAt], function (err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  }
}

export async function getTweetPagination(beforeId: string | null, beforeCreatedAt: string | null)
{
  let tweets = await new Promise((resolve, reject) => {
    let sql = 'SELECT * FROM tweet';
    const params: {[k: string]: any} = {};

    if (beforeId !== null && beforeCreatedAt !== null) {
      sql += " WHERE (json_extract(data, '$.created_at') = $created_at AND id < $id) OR json_extract(data, '$.created_at') < $created_at";
      params.$id = beforeId;
      params.$created_at = beforeCreatedAt;
    }

    sql += " ORDER BY json_extract(data, '$.created_at') DESC, id DESC LIMIT 10;";

    db.all(sql, params, function(err, rows) {
      if (err) {
        reject(err);
        return;
      }

      rows.forEach((row) => {
        row.data = JSON.parse(row.data);
      });

      resolve(rows);
    });
  });

  tweets = await Promise.all(tweets.map(async (tweet: any) => {
      const media = tweet.data?.attachments?.media_keys != undefined ? await getMedia(tweet.data.attachments.media_keys) : [];

      return {
        tweet: tweet,
        media: media,
      };
  }));

  return tweets;
}

function getMedia(mediaKeys: Array<string>) {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT * FROM media WHERE id IN (';
    const count = mediaKeys.length;
    for (let i = 0; i < count; i++) {
      sql += '?';
      if (i != count - 1) {
        sql += ',';
      }
    }
    sql += ');';

    db.all(sql, mediaKeys, function(err, rows) {
      if (err) {
        reject(err);
        return;
      }

      rows.forEach((row) => {
        row.data = JSON.parse(row.data);
      });

      resolve(rows);
    });
  });
}
