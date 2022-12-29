import { ApolloClient, DefaultOptions, from, gql, HttpLink, InMemoryCache } from '@apollo/client/core'

import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

import fetch from 'cross-fetch'

export function getApolloClient(uri: string, token?: string) {
	const defaultOptions: DefaultOptions = {
		watchQuery: {
			fetchPolicy: 'no-cache',
			errorPolicy: 'all',
		},
		query: {
			fetchPolicy: 'no-cache',
			errorPolicy: 'all',
		},
		mutate: {
			errorPolicy: 'all',
		},
	}

	const httpLink = new HttpLink({ uri, fetch })

	const authLink = setContext((_request, { headers }) => ({
		headers: {
			...headers,
			authorization: token ? `${token}` : '',
		},
	}))

	const errorLink = onError(({ graphQLErrors, networkError }) => {
		if (graphQLErrors)
			graphQLErrors.forEach((error) => {
				if (error.extensions.code === 'INTERNAL_SERVER_ERROR') {
					console.error(JSON.stringify(error, undefined, 2))
					// console.log(
					//   `[GraphQL error]: Message: ${error.message}`,
					// )
				}
			})

		if (networkError) {
			console.log(`[Network error]: ${JSON.stringify(networkError, undefined, 2)}`)
		}
	})

	return new ApolloClient({
		link: from([errorLink, authLink, httpLink]),
		cache: new InMemoryCache(),
		defaultOptions,
	})
}
