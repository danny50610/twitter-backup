import axios from 'axios';
import { addTweet } from './database';

export async function fetchTwitterUserLiked() {
  const userId = import.meta.env.VITE_USER_ID;

  let count = 0;
  const maxCount = 222;
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

    // TODO: data.includes.media

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

// export async function test2() {
//   addTweet('1111', {'AAA': 'BBB'});
//   addTweet('1111', {'AAA': 'CCC'});
//   addTweet('1112', {'AAA': 'BBB'});
// }
