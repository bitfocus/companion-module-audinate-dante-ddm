import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client/core'
import { DomainQuery } from '../graphql-codegen/graphql'
import { AudinateDanteModule } from '../main'
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

export async function getDomain(	
	self: AudinateDanteModule
): Promise<DomainQuery['domain']> {
	try {
		let apolloClient: ApolloClient<NormalizedCacheObject> = self.apolloClient
		let domainId: string = self.config.domainID

		const result = await apolloClient.query<DomainQuery>({
			query: domainQuery,
			variables: { domainIDInput: domainId },
		})
		if (result.error) {
			console.log(result.error)
			return
		}
		self.updateStatus(InstanceStatus.Ok);
		return result.data.domain
	} catch (e) {
		if (e instanceof Error) {
			console.error(e.message)
			return
		}
		console.error(JSON.stringify(e))
		return
	}
}
