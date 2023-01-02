import { CompanionPresetDefinitions } from '@companion-module/base'
import { AudinateDanteModule } from './main'

export function generatePresets(self: AudinateDanteModule): CompanionPresetDefinitions {
	return {
		subscribeChannel: {
			name: 'Subscribe Dante Channel',
			category: 'Commands',
			feedbacks: [
				{
					feedbackId: 'isSubscribed',
					options: {
						useSelector: false,
						rxSelector: 'rx-selector-1',
					},
					style: {
						bgcolor: parseInt('BBBB00', 16),
					},
				},
				{
					feedbackId: 'isSubscribedAndHealthy',
					options: {
						useSelector: false,
						rxSelector: 'rx-selector-1',
					},
					style: {
						bgcolor: parseInt('00CC00', 16),
					},
				},
			],
			type: 'button',
			style: {
				text: 'Subscribe Dante Channel',
				size: '14',
				color: parseInt('FFFFFF', 16),
				bgcolor: parseInt('000000', 16),
			},
			steps: [
				{
					up: [
						{
							actionId: 'subscribeChannel',
							options: {
								useSelector: false,
								rxSelector: 'rx-selector-1',
							},
						},
					],
					down: [],
				},
			],
		},
		setRxSelector: {
			name: 'Set Rx Selector',
			category: 'Commands',
			feedbacks: [
				{
					feedbackId: 'isSelected',
					options: {
						useSelector: false,
						rxSelector: 'rx-selector-1',
					},
					style: {
						bgcolor: parseInt('555555', 16),
					},
				},
			],
			type: 'button',
			style: {
				text: 'Set Rx Selector',
				size: '14',
				color: parseInt('FFFFFF', 16),
				bgcolor: parseInt('000000', 16),
			},
			steps: [
				{
					up: [
						{
							actionId: 'setDestinationChannel',
							options: {
								useSelector: false,
								rxSelector: 'rx-selector-1',
							},
						},
					],
					down: [],
				},
			],
		},
	}
}
