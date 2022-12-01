import { join } from 'path';
const fs = require('node:fs');

export let photoPath: string;

export function initConfig(appPath: string) {
  photoPath = join(appPath, 'media', 'photo');
  fs.mkdirSync(photoPath, { recursive: true });
}
