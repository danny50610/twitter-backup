import axios from 'axios';
import { addMedia, addTweet, addUser, getTweetPagination } from './database';
import { join, dirname } from 'node:path';
import { twitterFilePath, twitterVideoPath } from './config';
const fs = require('node:fs');
const url = require('node:url');

export async function fetchTwitterUserLiked() {
  const userId = import.meta.env.VITE_USER_ID;

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
      'user.fields': [
        'id',
        'name',
        'username',
        'profile_image_url',
      ].join(','),
      'expansions': 'attachments.media_keys,author_id',
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
        const type = media.type;

        addMedia(media.media_key, media);
        if (type == 'photo') {
          downloadFile(media.url, join(twitterFilePath, url.parse(media.url).pathname));
        } else if (type == 'video') {
          downloadFile(media.preview_image_url, join(twitterFilePath, url.parse(media.preview_image_url).pathname));

          const videoUrl = findMaxBitRateMp4Url(media);
          downloadFile(videoUrl, join(twitterVideoPath, url.parse(videoUrl).pathname));
        }
      });
    }

    if (data?.includes?.users) {
      data.includes.users.forEach(async (user: any) => {
        addUser(user.id, user);
        downloadFile(user.profile_image_url, join(twitterFilePath, url.parse(user.profile_image_url).pathname));
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

function findMaxBitRateMp4Url(media: any) {
  let result = null;
  let bitRate = 0;
  media.variants.forEach((variant: any) => {
    if (variant.content_type == 'video/mp4' && variant.bit_rate > bitRate) {
      bitRate = variant.bit_rate;
      result = variant.url;
    }
  });

  if (result === null) {
    console.warn('Can not find video. (media: ' + media.media_key + ')');
  }

  return result;
}

export async function getTweet(beforeId: string | null, beforeCreatedAt: string | null) {
  return await getTweetPagination(beforeId, beforeCreatedAt);
}

async function downloadFile(url: string, savePath: string ) {
  const dirName = dirname(savePath);
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });

  fs.writeFileSync(savePath, response.data);
}
