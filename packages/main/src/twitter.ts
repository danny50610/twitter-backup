import axios from 'axios';
import { app } from 'electron';
import { addMedia, addTweet, getTweetPagination } from './database';
import { join } from 'node:path';
const fs = require('node:fs');
const url = require('node:url');

export async function fetchTwitterUserLiked() {
  const userId = import.meta.env.VITE_USER_ID;

  const appPath = app.getPath('userData');
  const mediaPath = join(appPath, 'media');
  fs.mkdirSync(mediaPath, { recursive: true });

  let count = 0;
  const maxCount = 222; // TODO: remove
  let paginationToken = null;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const params: {[k: string]: any} = {
      'tweet.fields': [
        'created_at',
        'author_id',
        'entities',
        'attachments',
      ].join(','),
      'media.fields': [
        'duration_ms',
        'height',
        'media_key',
        'preview_image_url',
        'public_metrics',
        'type',
        'url',
        'width',
        'alt_text',
        'variants',
      ].join(','),
      'expansions': 'attachments.media_keys',
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

    if (data?.includes?.media) {
      data.includes.media.forEach(async (media: any) => {
        addMedia(media.media_key, media);

        const type = media.type;
        if (type == 'photo') {
          const mediaResponse = await axios.get(media.url, {
            responseType: 'arraybuffer',
          });

          const filename = url.parse(media.url).pathname.split('/').at(-1);
          fs.writeFileSync(join(mediaPath, filename), mediaResponse.data);
        }
        // TODO: video
      });
    }

    count += data.meta.result_count ?? 0;
    if (count > maxCount) {
      break;
    }

    if (data.meta.next_token === undefined) {
      break;
    } else {
      paginationToken = data.meta.next_token;
    }
  }
}

export async function getTweet(beforeId: string | null, beforeCreatedAt: string | null) {
  return await getTweetPagination(beforeId, beforeCreatedAt);
}

