<script lang="ts" setup>

// import ReactiveCounter from '/@/components/ReactiveCounter.vue';
// import ReactiveHash from '/@/components/ReactiveHash.vue';
// import ElectronVersions from '/@/components/ElectronVersions.vue';

// const APP_VERSION = import.meta.env.VITE_APP_VERSION;

async function fetchTwitterUserLiked() {
  await window.electronAPI.fetchTwitterUserLiked();
  console.log('Done');
}

// function test2() {
//   window.electronAPI.test2();
// }

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
  </div>
</template>

<style>

</style>
