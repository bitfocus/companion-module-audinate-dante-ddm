import { CompanionActionDefinitions } from '@companion-module/base'
import { setDeviceSubscriptions } from './dante-api/setDeviceSubscriptions'
import { AudinateDanteModule } from './main'
import { parseSubscriptionInfoFromOptions } from './options'

export function generateActions(self: AudinateDanteModule): CompanionActionDefinitions {
	const availableRxChannels = self.domain.devices?.flatMap((d) => {
		return d.rxChannels.map((rxChannel) => ({
			id: `${rxChannel.index}@${d.id}`,
			label: `${rxChannel.name}@${d.name}`,
		}))
	})

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
				const subscriptionOptions = parseSubscriptionInfoFromOptions(self, action.options)
				if (!subscriptionOptions) {
					console.error(`subscription options not parsed, so not applying any subscription`)
				}

				const { rxChannelIndex, rxDeviceId, txChannelName, txDeviceName } = subscriptionOptions || {}

				console.log(
					`subscribing channel ${rxChannelIndex} on device ${rxDeviceId} to channel ${txChannelName} on device ${txDeviceName}`,
				)

				const result = await setDeviceSubscriptions(self, subscriptionOptions)

				if (result.errors) {
					console.error(result.errors)
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
				console.log(`set variable ${rxSelector.toString()} to ${rx.toString()}`)
				self.setVariableValues(self.variables)
				self.checkFeedbacks()
			},
		},
	}
}

export default generateActions
