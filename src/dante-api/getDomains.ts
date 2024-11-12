import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client/core'
import { DomainsQuery } from '../graphql-codegen/graphql'

export const domainsQuery = gql`
	query Domains {
		domains {
			id
			name
		}
	}
`

export async function getDomains(
	apolloClient: ApolloClient<NormalizedCacheObject>
): Promise<DomainsQuery['domains'] | undefined> {
	try {
		const result = await apolloClient.query<DomainsQuery>({
			query: domainsQuery,
		})
		if (result.error) {
			console.log(result.error)
			return undefined
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
