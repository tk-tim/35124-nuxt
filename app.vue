<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div>
</template>
<script setup lang="ts">
import { ApolloClient, HttpLink, InMemoryCache, from, gql } from '@apollo/client/core'
import { onError } from '@apollo/client/link/error'

function createSimpleApolloClient() {
  const httpLink = new HttpLink({
    uri: `https://countries.trevorblades.com/graphql`,
    fetch,
    credentials: 'include',
  })

  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors?.length) {
      console.warn('GraphQL errors in', operation.operationName, graphQLErrors)
    }
    if (networkError) {
      console.warn('Network error in', operation.operationName, networkError)
    }
  })

  const client = new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network', errorPolicy: 'ignore' },
      query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
      mutate: { errorPolicy: 'all' },
    },
  })

  return client
}

const apollo = createSimpleApolloClient()

await useAsyncData('fancyData', () => apollo.query({
  query: gql`
    query {
      countries {
        code
        name
        emoji
      }
    }
  `,
}))
</script>