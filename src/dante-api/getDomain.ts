import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client/core'
import { DomainQuery } from '../graphql-codegen/graphql'

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

export async function getDomain(
	apolloClient: ApolloClient<NormalizedCacheObject>,
	domainId: string
): Promise<DomainQuery['domain']> {
	const result = await apolloClient.query<DomainQuery>({
		query: domainQuery,
		variables: { domainIDInput: domainId },
	})
	if (result.error) {
		console.log(result.error)
		return
	}
	return result.data.domain
}
