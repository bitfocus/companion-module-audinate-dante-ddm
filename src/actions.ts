import { CompanionActionDefinitions, SomeCompanionActionInputField } from '@companion-module/base'
import { setDeviceSubscriptions, setMultipleChannelDeviceSubscriptions } from './dante-api/setDeviceSubscriptions.js'
import { AudinateDanteModule } from './main.js'
import { parseSubscriptionInfoFromOptions, parseSubscriptionVectorInfoFromOptions } from './options.js'
import { RxChannel } from './graphql-codegen/graphql.js'

export function generateActions(self: AudinateDanteModule): CompanionActionDefinitions {
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
		return {
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
								return o['rxDevice']?.valueOf() === data
							},
							isVisibleData: deviceId,
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

				console.log(
					`subscribing channel ${rxChannelIndex} on device ${rxDeviceId} to channel ${txChannelName} on device ${txDeviceName}`,
				)

				const result = await setDeviceSubscriptions(self, subscriptionOptions)

				if (result?.errors) {
					console.error(result.errors)
				}
				console.log(result)
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

				if (result?.errors) {
					console.error(result.errors)
				}
				console.log(result)
			},
			learn: (action) => {
				const { rxDevice } = action.options
				if (!rxDevice) {
					return undefined
				}

				const currentRxDevice = self.domain?.devices?.find((rxDevice) => rxDevice?.id === action.options.rxDevice)
				const optionsSubset: any = {}
				Object.entries(action.options).forEach(([key, value]) => {
					if (typeof value !== 'string') {
						return
					}
					if (typeof key !== 'string') {
						return
					}
					const rxChannel = key.split(`rxChannel`)
					if (rxChannel.length < 2) {
						return
					}
					const rxChannelIndex = parseInt(rxChannel[1].split(`:`)[1], 10)
					let [txChannel, txDevice] = value.split(`@`)
					currentRxDevice?.rxChannels?.find((channel) => {
						if (channel?.index === rxChannelIndex) {
							txChannel = channel.subscribedChannel ?? ``
							txDevice = channel.subscribedDevice ?? ``
						}
					})
					if (txDevice && txChannel !== '') {
						value = `${txChannel}@${txDevice}`
					} else {
						value = `clear`
					}
					optionsSubset[`${key}`] = value
				})
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
						console.log(`set variable ${rxSelector.toString()} to ${rx.toString()}`)
					} else {
						console.error('rx is undefined')
					}
				} else {
					console.error('rxSelector is undefined')
				}
				self.setVariableValues(self.variables)
				self.checkFeedbacks()
			},
		},
	}
}

export default generateActions
