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
