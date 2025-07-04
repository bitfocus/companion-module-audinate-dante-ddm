import { CompanionFeedbackDefinitions, DropdownChoice, SomeCompanionFeedbackInputField } from '@companion-module/base'
import { RxChannel, RxChannelSummary } from './graphql-codegen/graphql.js'
import { AudinateDanteModule } from './main.js'
import { parseSubscriptionInfoFromOptions, parseSubscriptionVectorInfoFromOptions } from './options.js'

function generateFeedbacks(self: AudinateDanteModule): CompanionFeedbackDefinitions {
	const variableSelector = [1, 2, 3, 4].map((s) => ({
		id: `rx-selector-${s}`,
		label: `Selector #${s}`,
	}))

	const buildSubscriptionDropdown = (rxChannel: RxChannel): SomeCompanionFeedbackInputField | undefined => {
		if (!rxChannel) {
			return undefined
		}
		const defaultOption =
			rxChannel.subscribedChannel === '' && rxChannel.subscribedDevice === ''
				? 'clear'
				: `${rxChannel.subscribedChannel}@${rxChannel.subscribedDevice}`
		return {
			id: `rxDeviceChannel-${rxChannel.id}`,
			type: 'dropdown',
			label: `${rxChannel.index}: ${rxChannel.name}`,
			default: defaultOption,
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

	const optionsGenerator = (): SomeCompanionFeedbackInputField[] => {
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
						return <SomeCompanionFeedbackInputField>{
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

	const options: SomeCompanionFeedbackInputField[] = [
		{
			id: 'rx',
			type: 'dropdown',
			label: 'Rx Channel@Device',
			default: 'Select a receive channel',
			choices: (self.domain?.devices?.flatMap((d) => {
				return (
					d?.rxChannels?.map((rxChannel) => ({
						id: `${rxChannel?.index}@${d.id}`,
						label: `${rxChannel?.name}@${d.name}`,
					})) ?? []
				)
			}) ?? []) as DropdownChoice[],
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
			choices: (self.domain?.devices?.flatMap((d) => {
				return d?.txChannels
					?.map((txChannel) =>
						txChannel
							? {
									id: `${txChannel.name}@${d.name}`,
									label: `${txChannel.name}@${d.name}`,
								}
							: null,
					)
					.filter((txChannel): txChannel is { id: string; label: string } => txChannel !== null)
			}) ?? []) as DropdownChoice[],
			allowCustom: true,
			tooltip: 'The transmitting device to subscribe to',
		},
	]

	return {
		isSubscribed: {
			name: 'isSubscribed',
			description: 'is the specified channel subscription already in place (may not be healthy)',
			type: 'boolean',
			defaultStyle: {
				// RBG hex value converted to decimal
				bgcolor: parseInt('BBBB00', 16),
			},
			options,
			callback: (feedback) => {
				const { rxChannelIndex, rxDeviceId, txChannelName, txDeviceName } =
					parseSubscriptionInfoFromOptions(self, feedback.options) || {}

				const currentRxDevice = self.domain?.devices?.find((rxDevice) => rxDevice?.id === rxDeviceId)

				const currentRxChannel = currentRxDevice?.rxChannels?.find(
					(rxChannel) => rxChannel?.index === Number(rxChannelIndex),
				)

				if (!currentRxDevice || !currentRxChannel) {
					return false
				}

				if (
					currentRxChannel?.subscribedDevice === txDeviceName &&
					currentRxChannel?.subscribedChannel === txChannelName
				) {
					return true
				}

				return false
			},
		},
		isSubscribedAndHealthy: {
			name: 'isSubscribedAndHealthy',
			description: 'is the specified channel subscription already in place and healthy',
			type: 'boolean',
			defaultStyle: {
				// RBG hex value converted to decimal
				bgcolor: parseInt('00CC00', 16),
			},
			options,
			callback: (feedback) => {
				const { rxChannelIndex, rxDeviceId, txChannelName, txDeviceName } =
					parseSubscriptionInfoFromOptions(self, feedback.options) || {}

				const currentRxDevice = self.domain?.devices?.find((rxDevice) => rxDevice?.id === rxDeviceId)

				const currentRxChannel = currentRxDevice?.rxChannels?.find(
					(rxChannel) => rxChannel?.index === Number(rxChannelIndex),
				)

				if (!currentRxDevice || !currentRxChannel) {
					return false
				}

				if (
					currentRxChannel?.subscribedDevice === txDeviceName &&
					currentRxChannel?.subscribedChannel === txChannelName &&
					currentRxChannel?.summary == RxChannelSummary.Connected
				) {
					return true
				}

				return false
			},
		},
		isSubscribedMultiChannel: {
			name: 'isSubscribedMultiChannel',
			description:
				'is the specified multi-channel subscription already in place. Note: selecting "Ignore" would discard it from the feedback',
			type: 'boolean',
			defaultStyle: {
				// RBG hex value converted to decimal
				bgcolor: parseInt('BBBB00', 16),
			},
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
			callback: (feedback) => {
				const { deviceId, subscriptions } = parseSubscriptionVectorInfoFromOptions(feedback.options) || {}
				if (!deviceId) {
					return false
				}
				const currentRxDevice = self.domain?.devices?.find((rxDevice) => rxDevice?.id === deviceId)
				let foundMissingSubscription = false
				currentRxDevice?.rxChannels?.find((rxChannel) => {
					const subscribedChannel = subscriptions?.find((channelObject) => {
						return channelObject.rxChannelIndex === rxChannel?.index
					})
					if (subscribedChannel && subscribedChannel.subscribedChannel !== 'ignore') {
						if (
							!(
								rxChannel?.subscribedDevice === subscribedChannel.subscribedDevice &&
								rxChannel?.subscribedChannel === subscribedChannel.subscribedChannel
							)
						) {
							foundMissingSubscription = true
						}
					}
				})

				return !foundMissingSubscription
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
		isSubscribedMultiChannelAndHealthy: {
			name: 'isSubscribedMultiChannelAndHealthy',
			description: 'is the specified multi-channel subscription already in place and healthy',
			type: 'boolean',
			defaultStyle: {
				// RBG hex value converted to decimal
				bgcolor: parseInt('00CC00', 16),
			},
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
			callback: (feedback) => {
				const { deviceId, subscriptions } = parseSubscriptionVectorInfoFromOptions(feedback.options) || {}
				if (!deviceId) {
					return false
				}
				const currentRxDevice = self.domain?.devices?.find((rxDevice) => rxDevice?.id === deviceId)
				if (currentRxDevice?.rxChannels && currentRxDevice?.rxChannels.length < 1) {
					return false
				}
				let foundMissingSubscription = false
				currentRxDevice?.rxChannels?.find((rxChannel) => {
					const subscribedChannel = subscriptions?.find((channelObject) => {
						return channelObject.rxChannelIndex === rxChannel?.index
					})
					if (subscribedChannel && subscribedChannel.subscribedChannel !== 'ignore') {
						if (
							!(
								rxChannel?.subscribedDevice === subscribedChannel.subscribedDevice &&
								rxChannel?.subscribedChannel === subscribedChannel.subscribedChannel &&
								(rxChannel?.summary == RxChannelSummary.Connected || subscribedChannel.subscribedChannel === '')
							)
						) {
							foundMissingSubscription = true
						}
					}
				})

				return !foundMissingSubscription
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
		isSelected: {
			name: 'isSelected',
			description: 'is this selector already selected',
			type: 'boolean',
			defaultStyle: {
				// RBG hex value converted to decimal
				bgcolor: parseInt('555555', 16),
			},
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
					choices: (self.domain?.devices?.flatMap((d) => {
						return (
							d?.rxChannels?.map((rxChannel) => ({
								id: `${rxChannel?.index}@${d.id}`,
								label: `${rxChannel?.name}@${d.name}`,
							})) ?? []
						)
					}) ?? []) as DropdownChoice[],
					allowCustom: true,
					tooltip: 'The receiving channel to set the subscription on',
				},
			],
			callback: (feedback) => {
				const { rx, rxSelector } = feedback.options
				if (rxSelector) {
					self.variables[rxSelector.toString()] = rx?.toString()
				}
				const currentSelectorValue = rxSelector ? self.getVariableValue(rxSelector.toString()) : undefined
				if (currentSelectorValue === rx) {
					return true
				}
				return false
			},
		},
	}
}

export default generateFeedbacks
