import { CompanionPresetDefinitions } from '@companion-module/base'

export function generatePresets(): CompanionPresetDefinitions {
	return {
		subscribeMultiChannel: {
			name: 'Subscribe Multiple Dante Channel',
			category: 'Commands',
			feedbacks: [
				{
					feedbackId: 'isSubscribedMultiChannel',
					options: {
						rxDevice: '',
					},
					style: {
						bgcolor: parseInt('BBBB00', 16),
					},
				},
				{
					feedbackId: 'isSubscribedMultiChannelAndHealthy',
					options: {
						rxDevice: '',
					},
					style: {
						bgcolor: parseInt('00CC00', 16),
					},
				},
			],
			type: 'button',
			style: {
				text: 'Subscribe Multi Dante Channel',
				size: '14',
				color: parseInt('FFFFFF', 16),
				bgcolor: parseInt('000000', 16),
			},
			steps: [
				{
					up: [
						{
							actionId: 'subscribeMultiChannel',
							options: {
								rxDevice: '',
							},
						},
					],
					down: [],
				},
			],
		},
		subscribeChannel: {
			name: 'Subscribe Dante Channel',
			category: 'Commands',
			feedbacks: [
				{
					feedbackId: 'isSubscribed',
					options: {
						useSelector: true,
						rxSelector: 'rx-selector-1',
					},
					style: {
						bgcolor: parseInt('BBBB00', 16),
					},
				},
				{
					feedbackId: 'isSubscribedAndHealthy',
					options: {
						useSelector: true,
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
								useSelector: true,
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
						useSelector: true,
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
								useSelector: true,
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
