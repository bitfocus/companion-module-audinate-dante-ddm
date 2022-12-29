import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client/core'
import { CompanionActionDefinitions } from '@companion-module/base'
import { SetDeviceSubscriptionsMutation, SetDeviceSubscriptionsMutationVariables } from './graphql-codegen/graphql'

export const setDeviceSubscriptionsMutation = gql`
	mutation setDeviceSubscriptions($setDeviceSubscriptionsInput: SetDeviceSubscriptionsInput!) {
		setDeviceSubscriptions(input: $setDeviceSubscriptionsInput) {
			ok
		}
	}
`

const BLEDA_ID = '54a8aa35f20e4ea090855eca8a6cdb29'
const SPEAKER_LEFT_ID = '001dc1fffe5000a8:0'
const AVIOAO2_51f9e7 = '001dc1fffe51f9e7:0'

function generateActions(
	apolloClient: ApolloClient<NormalizedCacheObject>,
	domainID: string
): CompanionActionDefinitions {
	return {
		sample_action: {
			name: 'Subscribe Dante Channel',
			options: [
				{
					id: 'num',
					type: 'number',
					label: 'Test',
					default: 5,
					min: 0,
					max: 100,
				},
			],
			callback: async (event) => {
				console.log('Hello world!', event.options.num)

				const result = await apolloClient.mutate<
					SetDeviceSubscriptionsMutation,
					SetDeviceSubscriptionsMutationVariables
				>({
					mutation: setDeviceSubscriptionsMutation,
					variables: {
						setDeviceSubscriptionsInput: {
							deviceId: AVIOAO2_51f9e7,
							subscriptions: [
								{
									rxChannelIndex: 1,
									subscribedDevice: 'Bleda',
									subscribedChannel: '01',
								},
							],
						},
					},
				})

				if (result.errors) {
					console.log(result.errors)
				}
				console.log(result)
			},
		},
	}
}

export default generateActions
