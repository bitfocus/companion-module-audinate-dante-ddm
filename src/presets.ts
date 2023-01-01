import { CompanionPresetDefinitions } from '@companion-module/base'
import { AudinateDanteModule } from './main'

export function generatePresets(self: AudinateDanteModule): CompanionPresetDefinitions {
	return {
		subscribeChannel: {
			name: 'Subscribe Dante Channel',
			category: 'Commands',
			feedbacks: [],
			type: 'button',
			style: {
				text: 'Subscribe Dante Channel',
				size: '14',
				color: parseInt('000000', 16),
				bgcolor: parseInt('00CC00', 16),
			},
			steps: [],
			// options: [
			// 	{
			// 		id: 'rx',
			// 		type: 'dropdown',
			// 		label: 'Rx Channel@Device',
			// 		default: 'Select a receive channel',
			// 		choices: self.domain.devices?.flatMap((d) => {
			// 			return d.rxChannels.map((rxChannel) => ({
			// 				id: `${rxChannel.index}@${d.id}`,
			// 				label: `${rxChannel.name}@${d.name}`,
			// 			}))
			// 		}),
			// 		allowCustom: true,
			// 		tooltip: 'The receiving channel to set the subscription on',
			// 	},
			// 	{
			// 		id: 'tx',
			// 		type: 'dropdown',
			// 		label: 'Tx Channel@Device',
			// 		default: 'Select a transmit channel',
			// 		choices: self.domain.devices?.flatMap((d) => {
			// 			return d.txChannels.map((txChannel) => ({
			// 				id: `${txChannel.name}@${d.name}`,
			// 				label: `${txChannel.name}@${d.name}`,
			// 			}))
			// 		}),
			// 		allowCustom: true,
			// 		tooltip: 'The transmitting device to subscribe to',
			// 	},
			// ],
		},
	}
}
