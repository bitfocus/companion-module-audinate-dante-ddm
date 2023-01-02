import { gql } from '@apollo/client/core'
import { CompanionActionDefinitions } from '@companion-module/base'
import { SetDeviceSubscriptionsMutation, SetDeviceSubscriptionsMutationVariables } from './graphql-codegen/graphql'
import { AudinateDanteModule } from './main'

export const setDeviceSubscriptionsMutation = gql`
	mutation setDeviceSubscriptions($setDeviceSubscriptionsInput: SetDeviceSubscriptionsInput!) {
		setDeviceSubscriptions(input: $setDeviceSubscriptionsInput) {
			ok
		}
	}
`

export function generateActions(self: AudinateDanteModule): CompanionActionDefinitions {
	const availableRxChannels = self.domain.devices?.flatMap((d) => {
		return d.rxChannels.map((rxChannel) => ({
			id: `${rxChannel.index}@${d.id}`,
			label: `${rxChannel.name}@${d.name}`,
		}))
	})

	// TODO Consider making this it's own field to avoid confusion for the user
	const variableSelector = [1, 2, 3, 4].map((s) => ({
		id: `rx-selector-${s}`,
		label: `Selector #${s}`,
	}))

	return {
		subscribeChannel: {
			name: 'Subscribe Dante Channel',
			options: [
				{
					id: 'rx',
					type: 'dropdown',
					label: 'Rx Channel@Device',
					default: 'Select a receive channel',
					choices: availableRxChannels,
					allowCustom: true,
					tooltip: 'The receiving channel to set the subscription on',
					isVisible: (o) => {
						return o['useSelector'].valueOf() === false
					},
				},
				{
					id: 'rxSelector',
					type: 'dropdown',
					label: 'Rx Selector',
					default: 'rx-selector-1',
					choices: variableSelector,
					tooltip: 'Use in combination with "set destination" actions',
					isVisible: (o) => {
						return o['useSelector'].valueOf() === true
					},
				},
				{
					id: 'useSelector',
					type: 'checkbox',
					label: 'Use Rx Selector',
					default: false,
					tooltip: 'Use in combination with "set destination" actions',
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
				let { rx, tx, useSelector, rxSelector } = action.options

				if (useSelector) {
					if (!rxSelector || typeof rxSelector !== 'string') {
						return
					}
					rx = self.getVariableValue(rxSelector)
				}

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

		setDestinationChannel: {
			name: 'Set Destination',
			options: [
				{
					id: 'rxSelector',
					type: 'dropdown',
					label: 'Rx Selector',
					default: 'rx-selector-1',
					choices: variableSelector,
					tooltip: 'The selector to set',
				},
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
			],
			callback: async (action) => {
				const { rx, rxSelector } = action.options
				self.variables[rxSelector.toString()] = rx.toString()
				self.setVariableValues(self.variables)
			},
		},
	}
}

export default generateActions
