import { CompanionVariableDefinition, DropdownChoice } from '@companion-module/base'

export function generateVariables(): CompanionVariableDefinition[] {
	return [
		{
			variableId: 'rx-selector-1',
			name: 'Rx Selector #1',
		},
		{
			variableId: 'rx-selector-2',
			name: 'Rx Selector #2',
		},
		{
			variableId: 'rx-selector-3',
			name: 'Rx Selector #3',
		},
		{
			variableId: 'rx-selector-4',
			name: 'Rx Selector #4',
		},
	]
}

/**
 * @description Returns a list of the available variables in a form that is
 * ready for a drop down menu (ie. a choice field in actions or feedback)
 */
export function getSelectorsFromVariablesForDropdown(): DropdownChoice[] {
	return [1, 2, 3, 4].map((s) => ({
		id: `rx-selector-${s}`,
		label: `Selector #${s}`,
	}))
}
