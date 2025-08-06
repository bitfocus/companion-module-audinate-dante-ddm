import { CompanionActionDefinitions, SomeCompanionActionInputField } from '@companion-module/base'
import { setDeviceSubscriptions, setMultipleChannelDeviceSubscriptions } from './dante-api/setDeviceSubscriptions.js'
import { AudinateDanteModule } from './main.js'
import { parseSubscriptionInfoFromOptions, parseSubscriptionVectorInfoFromOptions } from './options.js'
import { RxChannel } from './graphql-codegen/graphql.js'

export function generateActions(self: AudinateDanteModule): CompanionActionDefinitions {
	// Bind methods to `self` to prevent `this` scoping issues, satisfying the unbound-method lint rule.
	const setVariableValues = self.setVariableValues.bind(self)
	const checkFeedbacks = self.checkFeedbacks.bind(self)

	const availableRxChannels = self.domain?.devices?.flatMap((d) => {
		return d?.rxChannels?.map((rxChannel) => ({
			id: `${rxChannel?.index}@${d.id}`,
			label: `${rxChannel?.name}@${d.name}`,
		}))
	})

	const variableSelector = [1, 2, 3, 4].map((s) => ({
		id: `rx-selector-${s}`,
		label: `Selector #${s}`,
	}))

	const buildSubscriptionDropdown = (rxChannel: RxChannel): SomeCompanionActionInputField | undefined => {
		if (!rxChannel) {
			return undefined
		}
		return <SomeCompanionActionInputField>{
			id: `rxDeviceChannel-${rxChannel.id}`,
			type: 'dropdown',
			label: `${rxChannel.index}: ${rxChannel.name}`,
			default: 'ignore',
			choices: [
				{
					id: 'clear',
					label: 'Clear',
				},
				{
					id: 'ignore',
					label: 'Ignore',
				},
				...(self.domain?.devices
					?.flatMap((d) => {
						return d?.txChannels?.map((txChannel) => {
							if (txChannel && d) {
								return {
									id: `${txChannel.name}@${d.name}`,
									label: `${txChannel.name}@${d.name}`,
								}
							}
							return null
						})
					})
					.filter((channel): channel is { id: string; label: string } => channel !== undefined) ?? []),
			],
		}
	}

	const optionsGenerator = (): SomeCompanionActionInputField[] => {
		return (
			self.domain?.devices
				?.flatMap((d) => {
					if (!d || !d.rxChannels) {
						return undefined
					}
					return d.rxChannels.map((rxChannel) => {
						if (!rxChannel) {
							return undefined
						}
						const deviceId = d.id
						return <SomeCompanionActionInputField>{
							...buildSubscriptionDropdown(rxChannel),
							isVisible: (o, data) => {
								return o['rxDevice']?.valueOf() === data.deviceId
							},
							isVisibleData: { deviceId },
						}
					})
				})
				.filter((device) => device !== undefined) ?? []
		)
	}

	return {
		subscribeChannel: {
			name: 'Subscribe Dante Channel',
			options: [
				{
					id: 'rx',
					type: 'dropdown',
					label: 'Rx Channel@Device',
					default: 'Select a receive channel',
					choices: availableRxChannels?.filter((channel) => channel !== undefined) ?? [],
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
					choices: variableSelector,
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
					choices:
						self.domain?.devices
							?.flatMap((d) => {
								return d?.txChannels?.map((txChannel) => {
									if (txChannel && d) {
										return {
											id: `${txChannel.name}@${d.name}`,
											label: `${txChannel.name}@${d.name}`,
										}
									}
									return undefined
								})
							})
							.filter((channel): channel is { id: string; label: string } => channel !== undefined) ?? [],
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

				const { rxChannelIndex, rxDeviceId, txChannelName, txDeviceName } = subscriptionOptions || {}

				self.log(
					'info',
					`subscribing channel ${rxChannelIndex} on device ${rxDeviceId} to channel ${txChannelName} on device ${txDeviceName}`,
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
					choices:
						self.domain?.devices
							?.map((d) => {
								if (d?.name && d.id) {
									return {
										id: d.id,
										label: d.name,
									}
								}
								return undefined
							})
							.filter((channel): channel is { id: string; label: string } => channel !== undefined) ?? [],
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
				...optionsGenerator(),
			],
			callback: async (action) => {
				const subscriptionOptions = parseSubscriptionVectorInfoFromOptions(action.options)

				if (!subscriptionOptions) {
					console.error(`subscription options not parsed, so not applying any subscription`)
					return
				}

				for (const subscriptionObj of subscriptionOptions.subscriptions) {
					self.log(
						'debug',
						`subscribing channel ${subscriptionObj.rxChannelIndex} on device ${subscriptionOptions.deviceId} to channel ${subscriptionObj.subscribedChannel} on device ${subscriptionObj.subscribedDevice}`,
					)
				}
				const result = await setMultipleChannelDeviceSubscriptions(self, subscriptionOptions)

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
					choices: variableSelector,
					tooltip: 'The selector to set',
				},
				{
					id: 'rx',
					type: 'dropdown',
					label: 'Rx Channel@Device',
					default: 'Select a receive channel',
					choices:
						self.domain?.devices
							?.flatMap((d) => {
								return d?.rxChannels?.map((rxChannel) => ({
									id: `${rxChannel?.index}@${d.id}`,
									label: `${rxChannel?.name}@${d.name}`,
								}))
							})
							.filter((channel): channel is { id: string; label: string } => channel !== undefined) ?? [],
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
