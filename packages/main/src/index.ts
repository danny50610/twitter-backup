import {app, ipcMain, protocol} from 'electron';
import './security-restrictions';
import {restoreOrCreateWindow} from '/@/mainWindow';
import { closeDatabase, initDatabase } from './database';
import { fetchTwitterUserLiked, getTweet } from './twitter';
import { initConfig, twitterFilePath } from './config';
const url = require('node:url');

/**
 * Prevent electron from running multiple instances.
 */
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration to save more system resources.
 */
app.disableHardwareAcceleration();

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  closeDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on('activate', restoreOrCreateWindow);

/**
 * Create the application window when the background process is ready.
 */
app
  .whenReady()
  .then(restoreOrCreateWindow)
  .catch(e => console.error('Failed create window:', e));

/**
 * Install Vue.js or any other extension in development mode only.
 * Note: You must install `electron-devtools-installer` manually
 */
if (import.meta.env.DEV) {
  app.whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(({default: installExtension, VUEJS3_DEVTOOLS}) => installExtension(VUEJS3_DEVTOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
    }))
    .catch(e => console.error('Failed install extension:', e));
}

/**
 * Check for new version of the application - production mode only.
 */
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => import('electron-updater'))
    .then(({autoUpdater}) => autoUpdater.checkForUpdatesAndNotify())
    .catch(e => console.error('Failed check updates:', e));
}

app
  .whenReady()
  .then(() => {
    const appPath = app.getPath('userData');

    initConfig(appPath);
    initDatabase(appPath);

    ipcMain.handle('fetchTwitterUserLiked', fetchTwitterUserLiked);
    ipcMain.handle('getTweet', (_event, ...args) => { return getTweet(args[0], args[1]); });

    protocol.registerFileProtocol('twitter-file', (request, callback) => {
      let requestUrl = request.url.replace('twitter-file://', '');
      requestUrl = url.parse(requestUrl).pathname;
      requestUrl = twitterFilePath + '/' + requestUrl;

      try {
        return callback(requestUrl);
      }
      catch (error) {
        console.error(error);
        return callback('404');
      }
    });
  });
