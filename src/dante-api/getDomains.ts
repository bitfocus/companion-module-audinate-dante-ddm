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

export async function getDomains(apolloClient: ApolloClient<NormalizedCacheObject>): Promise<DomainsQuery['domains']> {
	const result = await apolloClient.query<DomainsQuery>({
		query: domainsQuery,
	})
	if (result.error) {
		console.log(result.error)
	}
	return result.data.domains
}
