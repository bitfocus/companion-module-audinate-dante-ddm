import { CompanionVariableDefinition, DropdownChoice } from '@companion-module/base'

export function generateVariables(n: number): CompanionVariableDefinition[] {
	return Array.from({ length: n }, (_, i) => i + 1).map((s) => ({
		variableId: `rx-selector-${s}`,
		name: `Rx Selector #${s}`,
	}))
}

/**
 * @description Returns a list of the available variables in a form that is
 * ready for a drop down menu (ie. a choice field in actions or feedback)
 */
export function getSelectorsFromVariablesForDropdown(n: number): DropdownChoice[] {
	return Array.from({ length: n }, (_, i) => i + 1).map((s) => ({
		id: `rx-selector-${s}`,
		label: `Selector #${s}`,
	}))
}
