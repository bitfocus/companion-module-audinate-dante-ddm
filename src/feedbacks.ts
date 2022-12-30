import { CompanionFeedbackDefinitions } from '@companion-module/base'
import { DomainQuery } from './graphql-codegen/graphql'
import { AudinateDanteModule } from './main'

function generateFeedbacks(self: AudinateDanteModule): CompanionFeedbackDefinitions {
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
				const { rx, tx } = feedback.options

				if (!rx || typeof rx !== 'string') {
					return false
				}

				if (!tx || typeof tx !== 'string') {
					return false
				}

				const [rxChannelIndex, rxDeviceId] = rx.toString().split('@')
				const [txChannelName, txDeviceName] = tx.toString().split('@')

				const currentRxDevice = self.domain.devices.find((rxDevice) => rxDevice.id === rxDeviceId)

				const currentRxChannel = currentRxDevice.rxChannels.find(
					(rxChannel) => rxChannel.index === Number(rxChannelIndex)
				)

				if (
					currentRxChannel.subscribedDevice === txDeviceName &&
					currentRxChannel.subscribedChannel === txChannelName
				) {
					return true
				}

				return false
			},
		},
	}
}

export default generateFeedbacks
