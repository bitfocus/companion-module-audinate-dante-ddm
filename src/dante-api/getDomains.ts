// eslint-disable-next-line n/no-missing-import
import { gql } from '@apollo/client/core/index.js'
import { DomainsQuery } from '../graphql-codegen/graphql.js'
import { AudinateDanteModule } from '../main.js'

export const domainsQuery = gql`
	query Domains {
		domains {
			id
			name
		}
	}
`

export async function getDomains(self: AudinateDanteModule): Promise<DomainsQuery['domains'] | undefined> {
	try {
		if (!self.apolloClient) {
			console.error('Apollo Client is not initialized')
			return
		}
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
