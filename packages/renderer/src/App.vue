<script lang="ts" setup>

// import ReactiveCounter from '/@/components/ReactiveCounter.vue';
// import ReactiveHash from '/@/components/ReactiveHash.vue';
// import ElectronVersions from '/@/components/ElectronVersions.vue';

import { reactive } from 'vue';

// const APP_VERSION = import.meta.env.VITE_APP_VERSION;

const tweetList = reactive([]);

function fetchTwitterUserLiked() {
  window.electronAPI.fetchTwitterUserLiked();
  console.log('Done'); // TOOD: wait
}

// async function getTweet() {

// }

async function test2() {
  let tweets = await window.electronAPI.getTweet();
  tweets.forEach((tweet) => {
    console.log(tweet.id);
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
      <div class="col-6">
        <div v-for="tweet in tweetList" :key="tweet.id" class="card my-2">
          <div class="card-body">
            <p style="white-space: pre;">{{ tweet.data.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>

</style>
