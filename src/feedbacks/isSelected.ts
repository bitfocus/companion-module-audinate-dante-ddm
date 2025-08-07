import { CompanionFeedbackDefinition } from '@companion-module/base'
import { AudinateDanteModule } from '../main.js'
import { getDropdownChoicesOfRxChannels } from '../options.js'

function isSelected(self: AudinateDanteModule): CompanionFeedbackDefinition {
	return {
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
	}
}

export default isSelected
