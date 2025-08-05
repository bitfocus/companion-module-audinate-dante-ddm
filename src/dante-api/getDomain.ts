// eslint-disable-next-line n/no-missing-import
import { ApolloClient, gql } from '@apollo/client/core/index.js'
// eslint-disable-next-line n/no-missing-import
import { NormalizedCacheObject } from '@apollo/client/cache/index.js'

import { DomainQuery } from '../graphql-codegen/graphql.js'
import { AudinateDanteModule } from '../main.js'
import { InstanceStatus } from '@companion-module/base'

export const domainQuery = gql`
	query Domain($domainIDInput: ID!) {
		domain(id: $domainIDInput) {
			id
			name
			devices {
				id
				name
				rxChannels {
					id
					index
					name
					subscribedDevice
					subscribedChannel
					status
					summary
				}
				txChannels {
					id
					index
					name
				}
			}
		}
	}
`

export async function getDomain(self: AudinateDanteModule): Promise<DomainQuery['domain']> {
	const domainId: string = self.config.domainID
	try {
		const apolloClient: ApolloClient<NormalizedCacheObject> | undefined = self.apolloClient
		if (!apolloClient) {
			throw new Error('ApolloClient is not initialized')
		}

		const result = await apolloClient.query<DomainQuery>({
			query: domainQuery,
			variables: { domainIDInput: domainId },
		})

		self.updateStatus(InstanceStatus.Ok, 'Successfully polled domain')
		return result.data.domain
	} catch (e) {
		if (e instanceof Error) {
			self.log('error', `getDomain for ${domainId}: ${e.message}`)
		}
		return
	}
}
