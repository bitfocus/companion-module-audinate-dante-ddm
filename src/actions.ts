import { CompanionActionDefinitions } from '@companion-module/base'
import { setDeviceSubscriptions } from './dante-api/setDeviceSubscriptions.js'
import { AudinateDanteModule } from './main.js'
import {
	buildListOfDropdownsForRxChannelSubscriptions,
	getDropdownChoicesOfDevices,
	getDropdownChoicesOfRxChannels,
	getDropdownChoicesOfTxChannels,
	parseSubscriptionInfoFromOptions,
	parseSubscriptionVectorInfoFromOptions,
} from './options.js'

export function generateActions(self: AudinateDanteModule): CompanionActionDefinitions {
	// Bind methods to `self` to prevent `this` scoping issues, satisfying the unbound-method lint rule.
	const setVariableValues = self.setVariableValues.bind(self)
	const checkFeedbacks = self.checkFeedbacks.bind(self)

	return {
		subscribeChannel: {
			name: 'Subscribe Dante Channel',
			options: [
				{
					id: 'rx',
					type: 'dropdown',
					label: 'Rx Channel@Device',
					default: 'Select a receive channel',
					choices: getDropdownChoicesOfRxChannels(self.domain),
					allowCustom: true,
					tooltip: 'The receiving channel to set the subscription on',
					isVisible: (o) => {
						return o['useSelector']?.valueOf() === false
					},
				},
				{
					id: 'rxSelector',
					type: 'dropdown',
					label: 'Rx Selector',
					default: 'rx-selector-1',
					choices: self.selectorChoices,
					tooltip: 'Use in combination with "set destination" actions',
					isVisible: (o) => {
						return o['useSelector']?.valueOf() === true
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
					choices: getDropdownChoicesOfTxChannels(self.domain),
					allowCustom: true,
					tooltip: 'The transmitting device to subscribe to',
				},
			],
			callback: async (action) => {
				const subscriptionOptions = parseSubscriptionInfoFromOptions(self, action.options)
				if (!subscriptionOptions) {
					console.error(`subscription options not parsed, so not applying any subscription`)
					return
				}

				const subscription = subscriptionOptions.subscriptions[0]
				self.log(
					'info',
					`subscribing channel ${subscription.rxChannelIndex} on device ${subscriptionOptions.rxDeviceId} to channel ${subscription.subscribedChannel} on device ${subscription.subscribedDevice}`,
				)

				const result = await setDeviceSubscriptions(self, subscriptionOptions)

				if (!result) {
					self.log('error', `subscribeChannel failed`)
					return
				}

				self.log('info', `subscribeMultiChannel result: ${JSON.stringify(result.data, null, 2)}`)
			},
		},

		subscribeMultiChannel: {
			name: 'Subscribe Multiple Dante Channel',
			description:
				'From the drop down, select an Rx device, then make the required selections for each Rx channels with the dropdowns. Note: select "clear" to clear out the subscription and "Ignore" to not make any changes to the specific Rx channel. Select "Learn" to load latest state from the device',
			options: [
				{
					id: 'rxDevice',
					type: 'dropdown',
					label: 'Rx Device',
					default: ``,
					choices: getDropdownChoicesOfDevices(self.domain),
					allowCustom: true,
					tooltip: 'The receiving device to set the subscriptions on',
				},
				{
					id: 'rxChannelsHeader',
					label: 'Rx Channels',
					tooltip: 'The available RX channels of the selected device',
					type: 'static-text',
					value: '',
				},
				...buildListOfDropdownsForRxChannelSubscriptions(self.domain),
			],
			callback: async (action) => {
				const subscriptionOptions = parseSubscriptionVectorInfoFromOptions(action.options)
				if (!subscriptionOptions) {
					return
				}

				if (!subscriptionOptions.subscriptions) {
					console.error(`subscription options not parsed, so not applying any subscription`)
					return
				}

				for (const subscription of subscriptionOptions.subscriptions) {
					self.log(
						'debug',
						`subscribing channel ${subscription.rxChannelIndex} on device ${subscriptionOptions.rxDeviceId} to channel ${subscription.subscribedChannel} on device ${subscription.subscribedDevice}`,
					)
				}
				const result = await setDeviceSubscriptions(self, subscriptionOptions)

				if (!result) {
					self.log('error', `subscribeMultiChannel failed`)
					return
				}

				self.log('info', `subscribeMultiChannel result: ${JSON.stringify(result.data, null, 2)}`)
			},
			learn: (action) => {
				const { rxDevice } = action.options
				if (!rxDevice) {
					return undefined
				}

				const currentRxDevice = self.domain?.devices?.find((d) => d?.id === action.options.rxDevice)
				if (!currentRxDevice) {
					return action.options // Return original options if device not found
				}
				const optionsSubset: any = {}
				const keyPrefix = 'rxDeviceChannel-'

				// Iterate over the action's options to find the ones we need to update
				Object.entries(action.options).forEach(([key, _value]) => {
					if (typeof key !== 'string' || !key.startsWith(keyPrefix)) {
						return // Skip options that aren't for an Rx channel
					}

					// Extract the channel ID from the option key (e.g., 'd1-rx1')
					const rxChannelId = key.substring(keyPrefix.length)
					const targetChannel = currentRxDevice.rxChannels?.find((ch) => ch!.id === rxChannelId)

					if (targetChannel) {
						const { subscribedChannel, subscribedDevice } = targetChannel
						if (subscribedChannel && subscribedDevice) {
							// If subscribed, set the value to 'channel@device'
							optionsSubset[key] = `${subscribedChannel}@${subscribedDevice}`
						} else {
							// If not subscribed, set the value to 'clear'
							optionsSubset[key] = 'clear'
						}
					}
				})

				// Return the original options merged with our learned values
				return {
					...action.options,
					...optionsSubset,
				}
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
					choices: self.selectorChoices,
					tooltip: 'The selector to set',
				},
				{
					id: 'rx',
					type: 'dropdown',
					label: 'Rx Channel@Device',
					default: 'Select a receive channel',
					choices: getDropdownChoicesOfRxChannels(self.domain),
					allowCustom: true,
					tooltip: 'The receiving channel to set the subscription on',
				},
			],
			callback: async (action) => {
				const { rx, rxSelector } = action.options
				if (rxSelector) {
					if (rx) {
						self.variables[rxSelector.toString()] = rx.toString()
						self.log('info', `set variable ${rxSelector.toString()} to ${rx.toString()}`)
						setVariableValues(self.variables)
						checkFeedbacks()
					} else {
						self.log('error', 'rx is undefined')
					}
				} else {
					self.log('error', 'rxSelector is undefined')
				}
			},
		},
	}
}

export default generateActions
