import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client/core'
import { CompanionActionDefinitions } from '@companion-module/base'
import {
	DomainQuery,
	SetDeviceSubscriptionsMutation,
	SetDeviceSubscriptionsMutationVariables,
} from './graphql-codegen/graphql'
import { AudinateDanteModule } from './main'

export const setDeviceSubscriptionsMutation = gql`
	mutation setDeviceSubscriptions($setDeviceSubscriptionsInput: SetDeviceSubscriptionsInput!) {
		setDeviceSubscriptions(input: $setDeviceSubscriptionsInput) {
			ok
		}
	}
`

export function generateActions(self: AudinateDanteModule): CompanionActionDefinitions {
	return {
		sample_action: {
			name: 'Subscribe Dante Channel',
			options: [
				{
					id: 'rx',
					type: 'dropdown',
					label: 'Rx Channel@Device',
					default: 'Select a receive channel',
					choices: self.domain.devices?.flatMap((d) => {
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
					choices: self.domain.devices?.flatMap((d) => {
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
				const { rx, tx } = action.options

				if (!rx || typeof rx !== 'string') {
					return
				}

				if (!tx || typeof tx !== 'string') {
					return
				}

				const [rxChannelIndex, rxDeviceId] = rx.toString().split('@')
				const [txChannelName, txDeviceName] = tx.toString().split('@')

				console.log(`subscribing ${rxChannelIndex} on ${rxDeviceId} to ${txChannelName}@${txDeviceName}`)

				const result = await self.apolloClient.mutate<
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
