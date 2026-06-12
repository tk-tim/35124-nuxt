<template>
  <div>
    {{ data }}
  </div>
</template>
<script setup lang="ts">
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, gql } from '@apollo/client/core'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { ErrorLink } from '@apollo/client/link/error'

function createSimpleApolloClient() {
  const httpLink = new HttpLink({
    uri: `https://countries.trevorblades.com/graphql`,
    fetch,
    credentials: 'include',
  })

  const errorLink = new ErrorLink(({ error, operation }) => {
    if (CombinedGraphQLErrors.is(error)) {
      console.warn(JSON.stringify({ message: 'GraphQL errors in', operation: operation.operationName, errors: error.errors }))
      return
    }

    console.warn(JSON.stringify({ message: 'Network error in', operation: operation.operationName, error }))
  })

  const client = new ApolloClient({
    link: ApolloLink.from([errorLink, httpLink]),
    cache: new InMemoryCache(),
  })

  return client
}

const apollo = createSimpleApolloClient()

const { data } = await useAsyncData('fancyData', async () => {
  try {
    const result = await apollo.query({
      query: gql`
        query {
          countries {
            code
            name
            emoji
          }
        }
      `,
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    })

    return {
      data: result.data,
      error: result.error
        ? { name: result.error.name, message: result.error.message }
        : null,
    }
  } catch (error) {
    return {
      data: null,
      error,
    }
  }
})
</script>