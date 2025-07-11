// eslint-disable-next-line n/no-unpublished-import
import { describe, it, expect } from 'vitest'
import { generateVariables } from './variables.js'

// Define the type to ensure type safety in the test
interface CompanionVariableDefinition {
	variableId: string
	name: string
}

describe('generateVariables', () => {
	it('should return the correct array of variable definitions', () => {
		// Define the exact output you expect the function to produce
		const expectedVariables: CompanionVariableDefinition[] = [
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

		const result = generateVariables()

		// Use .toEqual() to compare the objects' values
		expect(result).toEqual(expectedVariables)

		// You can also add more specific checks
		expect(result).toHaveLength(4)
		expect(result[0].name).toBe('Rx Selector #1')
	})

	// Alternative using a snapshot test
	it('should match the snapshot', () => {
		// This creates a snapshot file on the first run.
		// On subsequent runs, it compares the output to the saved snapshot.
		// This is very useful for testing large, static data structures.
		expect(generateVariables()).toMatchSnapshot()
	})
})
