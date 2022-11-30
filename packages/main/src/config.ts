import { app } from 'electron';
import { join } from 'path';
const fs = require('node:fs');

const appPath = app.getPath('userData');
export const mediaPath = join(appPath, 'media');

export function initConfig() {
  fs.mkdirSync(mediaPath, { recursive: true });
}
