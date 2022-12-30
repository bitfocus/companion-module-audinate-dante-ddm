import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client/core'
import { CompanionActionDefinitions } from '@companion-module/base'
import {
	DomainQuery,
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

function generateActions(
	apolloClient: ApolloClient<NormalizedCacheObject>,
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
							id: `${txChannel.name}@${d.name}`,
							label: `${txChannel.name}@${d.name}`,
						}))
					}),
					allowCustom: true,
					tooltip: 'The transmitting device to subscribe to',
				},
			],
			callback: async (action) => {
				const options = action.options
				const [rxChannelIndex, rxDeviceId] = options['rx'].toString().split('@')
				const [txChannelName, txDeviceName] = options['tx'].toString().split('@')

				console.log(`subscribing ${rxChannelIndex} on ${rxDeviceId} to ${txChannelName}@${txDeviceName}`)

				const result = await apolloClient.mutate<
					SetDeviceSubscriptionsMutation,
					SetDeviceSubscriptionsMutationVariables
				>({
					mutation: setDeviceSubscriptionsMutation,
					variables: {
						setDeviceSubscriptionsInput: {
							deviceId: rxDeviceId,
							subscriptions: [
								{
									rxChannelIndex: Number(rxChannelIndex),
									subscribedDevice: txDeviceName,
									subscribedChannel: txChannelName,
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
