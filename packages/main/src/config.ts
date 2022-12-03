import { join } from 'path';
const fs = require('node:fs');

export let twitterFilePath: string;
export let twitterVideoPath: string;

export function initConfig(appPath: string) {
  twitterFilePath = join(appPath, 'twitter-file');
  fs.mkdirSync(twitterFilePath, { recursive: true });

  twitterVideoPath = join(twitterFilePath, 'video');
  fs.mkdirSync(twitterVideoPath, { recursive: true });
}
