import { ApolloClient, DefaultOptions, from, gql, HttpLink, InMemoryCache } from '@apollo/client/core'

import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { InstanceStatus } from '@companion-module/base'

import fetch from 'cross-fetch'
import { AudinateDanteModule } from './main'

export function getApolloClient(self: AudinateDanteModule, uri: string, token?: string) {
	const defaultOptions: DefaultOptions = {
		watchQuery: {
			fetchPolicy: 'no-cache',
			errorPolicy: 'none',
		},
		query: {
			fetchPolicy: 'no-cache',
			errorPolicy: 'none',
		},
		mutate: {
			errorPolicy: 'none',
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
					console.log(`[GraphQL error]: Message: ${error.message}`)
				}
			})

		if (networkError) {
			self.updateStatus(InstanceStatus.ConnectionFailure, `Network error`)
			console.log(`[Network error]: ${JSON.stringify(networkError, undefined, 2)}`)
		}
	})

	return new ApolloClient({
		link: from([errorLink, authLink, httpLink]),
		cache: new InMemoryCache(),
		defaultOptions,
	})
}
