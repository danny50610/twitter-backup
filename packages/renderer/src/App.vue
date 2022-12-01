<script lang="ts" setup>
import { reactive } from 'vue';

const tweetList = reactive([]);

async function fetchTwitterUserLiked() {
  await window.electronAPI.fetchTwitterUserLiked();
  console.log('Done');
}

// async function getTweet() {

// }

async function test2() {
  let tweets = await window.electronAPI.getTweet();
  tweets.forEach((tweet: any) => {
    tweetList.push(tweet);
  });
  console.log('====================');
  // let tweets2 = await window.electronAPI.getTweet('1596435606229639169', '2022-11-26T09:28:03.000Z');
  // tweets2.forEach((tweet) => {
  //   console.log(tweet.id);
  // });
}

</script>

<template>
  <div class="container py-4 px-3 mx-auto">
    <h1>Twitter Backup</h1>
    <button
      class="btn btn-primary"
      @click="fetchTwitterUserLiked"
    >
      手動抓取
    </button>
    <button
      class="btn btn-primary"
      @click="test2"
    >
      Test2
    </button>
    <div class="row justify-content-center">
      <div class="col-xl-6">
        <div v-for="tweet in tweetList" :key="tweet.tweet.id" class="card my-2">
          <div class="card-body">
            <p style="white-space: pre;">{{ tweet.tweet.data.text }}</p>
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
</style>
