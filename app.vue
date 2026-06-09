<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div>
</template>
<script setup lang="ts">
const onRequest = () => {
  // MEMORY LEAK: This will cause a memory leak as the route object will be retained in memory for every request, even after the request is completed.
  // This is because the onRequest function creates a closure that captures the route object, and the onRequest function is called for every request.
  // As a result, the route object will be retained in memory for every request, even after the request is completed, leading to a memory leak over time as more and more requests are made.
  const route = useRoute()

  return (context: any) => {
    console.log('onRequest', route.fullPath, !!context)
  }
}

const apiFetch = $fetch.create({
  baseURL: 'https://jsonplaceholder.typicode.com/',
  onRequest: onRequest(),
  onRequestError: context => console.log(context),
  onResponseError: context => console.log(context),
  timeout: 30000,
})

useAsyncData('fancyData', () => apiFetch('/todos'))
</script>