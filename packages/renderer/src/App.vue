<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';

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

async function fetchTwitterUserLiked() {
  await window.electronAPI.fetchTwitterUserLiked();
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

  let tweets = await window.electronAPI.getTweet(beforeId, beforeCreatedAt);
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

</script>

<template>
  <div class="container py-4 px-3 mx-auto">
    <h1>Twitter Backup</h1>
    <button
      class="btn btn-primary"
      @click="fetchTwitterUserLiked"
    >
      開始備份
    </button>
    <div class="row justify-content-center">
      <div class="col-xl-6">
        <div class="card my-2" v-for="tweet in tweetList" :key="tweet.tweet.id">
          <div class="card-body">
            <div class="d-flex">
              <div class="user">AAA</div>
              <div class="tweet-content">
                <div class="mb-2">
                  <!-- FIXME: overflow -->
                  <span class="me-1">{{ tweet.user.data.name }}</span>
                  <span class="me-1">@{{ tweet.user.data.username }}</span>
                  <span class="me-1">·</span>
                  <span>{{ tweet.tweet.data.created_at }}</span>
                </div>
                <p style="white-space: pre-wrap;" class="card-text">{{ tweet.tweet.data.text }}</p>
                <div v-for="media in tweet.media" :key="media.id" class="media-photo">
                  <img v-if="media.data?.url" :src="('media-photo://' + media.data.filename)" class="rounded"
                       :height="media.data.height"
                       :width="media.data.width"
                  >
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
