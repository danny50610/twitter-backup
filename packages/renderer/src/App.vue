<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import { fetchTwitterUserLiked, getTweet } from '#preload';

const tweetList = reactive([]);

let tweetEndObserver;
let isLoadingMore = false;

onMounted(() => {
  loadTweet().then(() => {
    nextTick().then(() => {
      setUpInterSectionObserver();
    });
  });
});

onUnmounted(() => {
  if (tweetEndObserver) {
    tweetEndObserver.disconnect();
  }
});

async function doFetchTwitterUserLiked() {
  await fetchTwitterUserLiked();
  console.log('Done');
}

async function loadTweet() {
  isLoadingMore = true;

  let beforeId = null;
  let beforeCreatedAt = null;
  const tweetLength = tweetList.length;
  if (tweetLength > 0) {
    beforeId = tweetList[tweetLength - 1].tweet.id;
    beforeCreatedAt =  tweetList[tweetLength - 1].tweet.data.created_at;
  }

  let tweets = await getTweet(beforeId, beforeCreatedAt);
  tweets.forEach((tweet: any) => {
    tweetList.push(tweet);
  });

  isLoadingMore = false;
}

const sentinel = ref(null);
function setUpInterSectionObserver() {
  tweetEndObserver = new IntersectionObserver(
    handleIntersection,
    {
      rootMargin: '500px',
    },
  );

  tweetEndObserver.observe(sentinel.value);
}

function handleIntersection([entry]: IntersectionObserverEntry[]) {
  if (entry.isIntersecting && !isLoadingMore) {
    loadTweet();
  }
}

function findMaxBitRateMp4Url(media: any) {
  let result = null;
  let bitRate = 0;
  media.data.variants.forEach((variant: any) => {
    if (variant.content_type == 'video/mp4' && variant.bit_rate > bitRate) {
      bitRate = variant.bit_rate;
      result = variant.url;
    }
  });

  if (result === null) {
    console.warn('Can not find video. (media: ' + media.id + ')');
  }

  return result;
}

</script>

<template>
  <div class="container py-4 px-3 mx-auto">
    <h1>Twitter Backup</h1>
    <button
      class="btn btn-primary"
      @click="doFetchTwitterUserLiked"
    >
      開始備份
    </button>
    <div class="row justify-content-center">
      <div class="col-xl-6">
        <div class="card my-2" v-for="tweet in tweetList" :key="tweet.tweet.id">
          <div class="card-body">
            <div class="d-flex">
              <div class="user">
                <img :src="('twitter-file://' + tweet.user.data.profile_image_url)"
                    class="rounded-circle"
                  >
              </div>
              <div class="tweet-content">
                <div class="mb-2">
                  <!-- FIXME: overflow -->
                  <span class="fw-bold me-1">{{ tweet.user.data.name }}</span>
                  <span class="text-secondary me-1">@{{ tweet.user.data.username }}</span>
                  <span class="text-secondary me-1">·</span>
                  <span>{{ tweet.tweet.data.created_at }}</span>
                </div>

                <p style="white-space: pre-wrap;" class="card-text">{{ tweet.tweet.data.text }}</p>

                <div v-for="media in tweet.media" :key="media.id" class="media-photo">
                  <img v-if="media.data?.type == 'photo'" :src="'twitter-file://' + media.data.url" class="rounded"
                       :height="media.data.height"
                       :width="media.data.width"
                  >

                  <video v-else-if="media.data?.type == 'video'" controls muted>
                    <source :src="'twitter-video://' + findMaxBitRateMp4Url(media)" type="video/mp4">
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ref="sentinel" class="sentinel"></div>
      </div>
    </div>
  </div>
</template>

<style>
.media-photo {
  height: 510px;
  width: auto;
}

.media-photo img {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.media-photo video {
  height: 100%;
  width: 100%;
  object-fit: full;
}

.sentinel {
  height: 0px;
}

.user {
  flex-basis: 48px;
  flex-grow: 0;
  margin-right: 12px
}

.tweet-content {
  flex-basis: 0px;
  flex-grow: 1;
}
</style>
