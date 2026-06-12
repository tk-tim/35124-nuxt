<template>
  <div>
    {{ data }}
  </div>
</template>
<script setup lang="ts">
import { cacheExchange, createClient, fetchExchange } from '@urql/core'

function createSimpleUrqlClient() {
  return createClient({
    url: 'https://countries.trevorblades.com/graphqle',
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
      credentials: 'include',
    },
  })
}

const urql = createSimpleUrqlClient()

const COUNTRIES_QUERY = `
  query Countries {
    countries {
      code
      name
      emoji
    }
  }
`

const { data } = await useAsyncData('fancyData', async () => {
  try {
    const result = await urql
      .query(COUNTRIES_QUERY, {}, { requestPolicy: 'network-only' })
      .toPromise()

    if (result.error?.graphQLErrors.length) {
      console.warn('GraphQL errors in Countries', JSON.stringify(result.error.graphQLErrors))
    }

    if (result.error?.networkError) {
      console.warn('Network error in Countries', JSON.stringify(result.error.networkError))
    }

    return {
      data: result.data,
      error: result.error
        ? { name: result.error.name, message: result.error.message }
        : null,
    }
  } catch (error) {
    console.error('Error fetching Countries', JSON.stringify(error))
    return {
      data: null,
      error,
    }
  }
})
</script>