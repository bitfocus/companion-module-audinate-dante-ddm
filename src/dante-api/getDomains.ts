import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client/core'
import { DomainsQuery } from '../graphql-codegen/graphql'
import { AudinateDanteModule } from '../main'

export const domainsQuery = gql`
	query Domains {
		domains {
			id
			name
		}
	}
`

export async function getDomains(
	self: AudinateDanteModule
): Promise<DomainsQuery['domains'] | undefined> {
	try {		
		const result = await self.apolloClient.query<DomainsQuery>({
			query: domainsQuery,
		})
		if (result.error) {
			console.log(result.error)
			return
		}
		return result.data.domains
	} catch (e) {
		if (e instanceof Error) {
			console.error(e.message)
			return
		}
		console.error(JSON.stringify(e))
		return
	}
}
