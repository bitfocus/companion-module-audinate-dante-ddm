import { CompanionActionDefinitions } from '@companion-module/base'

function generateActions(config: ConfigType): CompanionActionDefinitions {
	return {
		sample_action: {
			name: 'Subscribe Dante Channel',
			options: [
				{
					id: 'num',
					type: 'number',
					label: 'Test',
					default: 5,
					min: 0,
					max: 100,
				},
			],
			callback: async (event) => {
				console.log('Hello world!', event.options.num)
			},
		},
	}
}

export default generateActions
