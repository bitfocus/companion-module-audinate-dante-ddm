import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client/core'
import { CompanionActionDefinitions } from '@companion-module/base'
import {
	DomainQuery,
	DomainsQuery,
	SetDeviceSubscriptionsMutation,
	SetDeviceSubscriptionsMutationVariables,
} from './graphql-codegen/graphql'

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
	domainID: string,
	domain: DomainQuery['domain']
): CompanionActionDefinitions {
	console.log(domain.devices)
	return {
		sample_action: {
			name: 'Subscribe Dante Channel',
			options: [
				{
					id: 'rx',
					type: 'dropdown',
					label: 'Rx Channel@Device',
					default: 'Select a receive channel',
					choices: domain.devices?.flatMap((d) => {
						return d.rxChannels.map((rxChannel) => ({
							id: `${rxChannel.index}@${d.id}`,
							label: `${rxChannel.name}@${d.name}`,
						}))
					}),
					allowCustom: true,
					tooltip: 'The receiving channel to set the subscription on',
				},
				{
					id: 'tx',
					type: 'dropdown',
					label: 'Tx Channel@Device',
					default: 'Select a transmit channel',
					choices: domain.devices?.flatMap((d) => {
						return d.txChannels.map((txChannel) => ({
							id: `${txChannel.index}@${d.id}`,
							label: `${txChannel.name}@${d.name}`,
						}))
					}),
					allowCustom: true,
					tooltip: 'The transmitting device to subscribe to',
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
