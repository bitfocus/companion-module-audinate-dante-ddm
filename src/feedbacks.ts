import { CompanionFeedbackDefinitions } from '@companion-module/base'
import { AudinateDanteModule } from './main'
const util = require('util')

function generateFeedbacks(self: AudinateDanteModule): CompanionFeedbackDefinitions {
	const variableSelector = [1, 2, 3, 4].map((s) => ({
		id: `rx-selector-${s}`,
		label: `Selector #${s}`,
	}))

	return {
		isSubscribed: {
			name: 'isSubscribed',
			description: 'is the specified channel subscription already in place and healthy',
			type: 'boolean',
			defaultStyle: {
				// RBG hex value converted to decimal
				bgcolor: parseInt('00CC00', 16),
			},
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
			callback: (feedback) => {
				let { rx, tx, useSelector, rxSelector } = feedback.options
				// console.log(util.inspect(self.domain, { depth: null, colors: true }))

				if (useSelector) {
					if (!rxSelector || typeof rxSelector !== 'string') {
						return
					}
					rx = self.getVariableValue(rxSelector)
				}

				if (!rx || typeof rx !== 'string') {
					return false
				}

				if (!tx || typeof tx !== 'string') {
					return false
				}

				const [rxChannelIndex, rxDeviceId] = rx.toString().split('@')
				const [txChannelName, txDeviceName] = tx.toString().split('@')

				const currentRxDevice = self.domain?.devices.find((rxDevice) => rxDevice.id === rxDeviceId)
				console.log(currentRxDevice)

				const currentRxChannel = currentRxDevice?.rxChannels.find(
					(rxChannel) => rxChannel.index === Number(rxChannelIndex)
				)

				if (
					currentRxChannel?.subscribedDevice === txDeviceName &&
					currentRxChannel?.subscribedChannel === txChannelName
				) {
					return true
				}

				return false
			},
		},
	}
}

export default generateFeedbacks
