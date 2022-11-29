import {app, ipcMain} from 'electron';
import './security-restrictions';
import {restoreOrCreateWindow} from '/@/mainWindow';
import { closeDatabase, initDatabase, addTweet } from './database';
import axios from 'axios';

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
// if (import.meta.env.DEV) {
//   app.whenReady()
//     .then(() => import('electron-devtools-installer'))
//     .then(({default: installExtension, VUEJS3_DEVTOOLS}) => installExtension(VUEJS3_DEVTOOLS, {
//       loadExtensionOptions: {
//         allowFileAccess: true,
//       },
//     }))
//     .catch(e => console.error('Failed install extension:', e));
// }

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

async function fetchTwitterUserLiked() {
  const userId = '957886038839648256'; // https://twitter.com/thePrimalSpace

  let paginationToken = null;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const params: {[k: string]: any} = {
      'tweet.fields': 'created_at,author_id,entities,attachments',
    };

    if (paginationToken != null) {
      params.pagination_token = paginationToken;
    }

    const response = await axios.get(`https://api.twitter.com/2/users/${userId}/liked_tweets`, {
      headers: {
        'Authorization': 'Bearer ' + import.meta.env.VITE_TWITTER_TOKEN,
      },
      params,
    });

    const data = response.data;

    if (data.data) {
      data.data.forEach((tweet: any) => {
        addTweet(tweet.id, tweet);
      });
    }

    if (data.meta.next_token === undefined) {
      break;
    } else {
      paginationToken = data.meta.next_token;
    }
  }
}

// async function test2() {
//   addTweet('1111', {'AAA': 'BBB'});
//   addTweet('1111', {'AAA': 'CCC'});
//   addTweet('1112', {'AAA': 'BBB'});
// }

app
  .whenReady()
  .then(() => {
    initDatabase(app);

    ipcMain.handle('fetchTwitterUserLiked', fetchTwitterUserLiked);

    // ipcMain.handle('test2', test2);
  });
