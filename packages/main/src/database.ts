import { Database } from 'sqlite3';
const path = require('node:path');

let db: Database;

export function initDatabase(app: Electron.App) {
  const appPath = app.getPath('userData');
  const dbPath = path.resolve(appPath, 'data.sqlite3');

  db = new Database(dbPath);

  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS tweet (id TEXT PRIMARY KEY, data JSON, updated_at INTEGER)');
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
        }

        resolve(true);
      });
    });
  } else {
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO tweet (id, data, updated_at) VALUES (?, ?, ?);', [id, jsonData, updatedAt], function (err) {
        if (err) {
          reject(err);
        }

        resolve(true);
      });
    });
  }
}
