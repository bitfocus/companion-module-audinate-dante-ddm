// eslint-disable-next-line n/no-missing-import
import { ApolloClient, DefaultOptions, from } from '@apollo/client/core/index.js'
// eslint-disable-next-line n/no-missing-import
import { HttpLink } from '@apollo/client/link/http/index.js'
// eslint-disable-next-line n/no-missing-import
import { InMemoryCache, NormalizedCacheObject } from '@apollo/client/cache/index.js'
// eslint-disable-next-line n/no-missing-import
import { setContext } from '@apollo/client/link/context/index.js'
// eslint-disable-next-line n/no-missing-import
import { onError } from '@apollo/client/link/error/index.js'
import { InstanceStatus } from '@companion-module/base'

import fetch from 'cross-fetch'
import http from 'http'
import https from 'https'
import { AudinateDanteModule } from './main.js'

export function getApolloClient(
	self: AudinateDanteModule,
	uri: string,
	token?: string,
): ApolloClient<NormalizedCacheObject> {
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

	const customFetch = async (uri: RequestInfo | URL, options: any) => {
		return fetch(uri, {
			...options,
			agent: function (_parsedURL: { protocol: string }) {
				if (_parsedURL.protocol == 'http:') {
					return new http.Agent({})
				} else {
					return new https.Agent({ rejectUnauthorized: !self.config.disableCertificateValidation })
				}
			},
			signal: AbortSignal.timeout(2000),
		})
	}

	const httpLink = new HttpLink({ uri, fetch: customFetch })

	const authLink = setContext((_request, { headers }) => ({
		headers: {
			...headers,
			authorization: token ? `${token}` : '',
		},
	}))

	const errorLink = onError(({ graphQLErrors, networkError }) => {
		if (graphQLErrors) {
			graphQLErrors.forEach((error) => {
				self.log('debug', `[GraphQL error]: ${error.message}`)
				self.log('debug', `${JSON.stringify(error, null, 2)}`)

				// Highlight internal server errors
				if (error.extensions && error.extensions.code === 'INTERNAL_SERVER_ERROR') {
					self.log('error', `[GraphQL server error]: Message: ${error.message}`)
				}
			})
		}

		if (networkError) {
			self.log('error', `[Network error]: ${networkError.message}`)
			console.log(`[Network error]: ${JSON.stringify(networkError, undefined, 2)}`)

			// Aggregate some common types of network errors into a more user friendly message
			const networkErrorMessages = ['Load failed', 'Failed to fetch', 'NetworkError when attempting to fetch resource']
			if (networkErrorMessages.some((networkErrorMessage) => networkError?.message?.includes(networkErrorMessage))) {
				networkError.message = 'Unable to connect to server'
			}

			self.updateStatus(InstanceStatus.ConnectionFailure, `Network error`)
		}
	})

	return new ApolloClient({
		link: from([errorLink, authLink, httpLink]),
		cache: new InMemoryCache(),
		defaultOptions,
	})
}
