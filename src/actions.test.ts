// eslint-disable-next-line n/no-unpublished-import
import { describe, it, expect, vi, beforeEach, assert } from 'vitest'
import { generateActions } from './actions.js'
import { AudinateDanteModule } from './main.js' // Assuming this is the type location
import { setDeviceSubscriptions, setMultipleChannelDeviceSubscriptions } from './dante-api/setDeviceSubscriptions.js'
import { parseSubscriptionInfoFromOptions, parseSubscriptionVectorInfoFromOptions } from './options.js'
import { CompanionActionDefinitions } from '@companion-module/base'

vi.mock('./dante-api/setDeviceSubscriptions.js', () => ({
	setDeviceSubscriptions: vi.fn(),
	setMultipleChannelDeviceSubscriptions: vi.fn(),
}))

vi.mock('./options.js', async () => {
	const actual = await vi.importActual('./options.js')
	return {
		...actual,
		parseSubscriptionInfoFromOptions: vi.fn(),
		parseSubscriptionVectorInfoFromOptions: vi.fn(),
		getDropdownChoicesOfDevices: vi.fn().mockReturnValue([
			{ id: 'device-1-id', label: 'Device One' },
			{ id: 'device-2-id', label: 'Device Two' },
		]),
		getDropdownChoicesOfRxChannels: vi.fn().mockReturnValue([
			{ id: '1@device-1-id', label: 'RX 1@Device One' },
			{ id: '2@device-1-id', label: 'RX 2@Device One' },
			{ id: '1@device-2-id', label: 'RX 1@Device Two' },
		]),
		getDropdownChoicesOfTxChannels: vi.fn().mockReturnValue([
			{ id: 'TX 1@Device One', label: 'TX 1@Device One' },
			{ id: 'TX 2@Device One', label: 'TX 2@Device One' },
			{ id: 'TX 1@Device Two', label: 'TX 1@Device Two' },
		]),
	}
})

const createMockSelf = (): AudinateDanteModule =>
	({
		domain: {
			devices: [
				{
					id: 'device-1-id',
					name: 'Device One',
					rxChannels: [
						{ id: 'd1-rx1', index: 1, name: 'RX 1', subscribedChannel: 'TX 1', subscribedDevice: 'Device Two' },
						{ id: 'd1-rx2', index: 2, name: 'RX 2', subscribedChannel: null, subscribedDevice: null },
					],
					txChannels: [
						{ id: 'd1-tx1', index: 1, name: 'TX 1' },
						{ id: 'd1-tx2', index: 2, name: 'TX 2' },
					],
				},
				{
					id: 'device-2-id',
					name: 'Device Two',
					rxChannels: [
						{ id: 'd2-rx1', index: 1, name: 'RX 1', subscribedChannel: 'TX 1', subscribedDevice: 'Device One' },
					],
					txChannels: [{ id: 'd2-tx1', index: 1, name: 'TX 1' }],
				},
			],
		},
		variables: {},
		log: vi.fn(),
		setVariableValues: vi.fn(),
		checkFeedbacks: vi.fn(),
	}) as unknown as AudinateDanteModule

describe('generateActions', () => {
	let self: AudinateDanteModule
	let actions: CompanionActionDefinitions

	beforeEach(() => {
		vi.clearAllMocks()
		self = createMockSelf()
		actions = generateActions(self)
		self.variables = {}
	})

	it('should return an object with three actions', () => {
		expect(Object.keys(actions)).toEqual(['subscribeChannel', 'subscribeMultiChannel', 'setDestinationChannel'])
	})

	describe('subscribeChannel', () => {
		it('should have correct name and options', () => {
			const action = actions.subscribeChannel
			if (!action) {
				assert.fail('action not defined')
			}
			expect(action).toBeDefined()
			expect(action.name).toBe('Subscribe Dante Channel')
			expect(action.options.length).toBe(4)
		})

		it('should generate correct choices for rx and tx dropdowns', () => {
			expect(actions?.subscribeChannel).toBeDefined()
			const rxOption = actions.subscribeChannel!.options.find((opt) => opt.id === 'rx')
			const txOption = actions.subscribeChannel!.options.find((opt) => opt.id === 'tx')

			const expectedRxChoices = [
				{ id: '1@device-1-id', label: 'RX 1@Device One' },
				{ id: '2@device-1-id', label: 'RX 2@Device One' },
				{ id: '1@device-2-id', label: 'RX 1@Device Two' },
			]
			const expectedTxChoices = [
				{ id: 'TX 1@Device One', label: 'TX 1@Device One' },
				{ id: 'TX 2@Device One', label: 'TX 2@Device One' },
				{ id: 'TX 1@Device Two', label: 'TX 1@Device Two' },
			]

			if (rxOption && rxOption.type === 'dropdown') {
				expect(rxOption.choices).toEqual(expectedRxChoices)
			} else {
				assert.fail('rxOption is not a dropdown or is undefined')
			}

			if (txOption && txOption.type === 'dropdown') {
				expect(txOption.choices).toEqual(expectedTxChoices)
			} else {
				assert.fail('txOption is not a dropdown or is undefined')
			}
		})

		it('callback should call setDeviceSubscriptions with parsed options', async () => {
			const mockOptions = {
				rxChannelIndex: 1,
				rxDeviceId: 'device-1-id',
				txChannelName: 'TX 1',
				txDeviceName: 'Device Two',
			}
			vi.mocked(parseSubscriptionInfoFromOptions).mockReturnValue(mockOptions)
			vi.mocked(setDeviceSubscriptions).mockResolvedValue({ data: {} })

			await actions.subscribeChannel!.callback({ options: {} } as any, {} as any)

			expect(parseSubscriptionInfoFromOptions).toHaveBeenCalled()
			expect(setDeviceSubscriptions).toHaveBeenCalledWith(self, mockOptions)
		})

		it('callback should not call setDeviceSubscriptions if options fail to parse', async () => {
			vi.mocked(parseSubscriptionInfoFromOptions).mockReturnValue(null)

			await actions.subscribeChannel!.callback({ options: {} } as any, {} as any)

			expect(parseSubscriptionInfoFromOptions).toHaveBeenCalled()
			expect(setDeviceSubscriptions).not.toHaveBeenCalled()
		})
	})

	describe('subscribeMultiChannel', () => {
		it('should have correct name and dynamic options', () => {
			const action = actions.subscribeMultiChannel
			if (!action) {
				assert.fail('"subscribeMultiChannel" action is not defined')
				return
			}

			expect(action.name).toBe('Subscribe Multiple Dante Channel')
			const rxDeviceOption = action.options.find((opt) => opt.id === 'rxDevice')

			// Add this type guard
			if (rxDeviceOption && rxDeviceOption.type === 'dropdown') {
				expect(rxDeviceOption.choices).toEqual([
					{ id: 'device-1-id', label: 'Device One' },
					{ id: 'device-2-id', label: 'Device Two' },
				])
			} else {
				assert.fail('rxDeviceOption is not a dropdown or is undefined')
			}
		})

		it('callback should call setMultipleChannelDeviceSubscriptions with parsed options', async () => {
			const mockVectorOptions = {
				deviceId: 'device-1-id',
				subscriptions: [{ rxChannelIndex: 1, subscribedChannel: 'TX 1', subscribedDevice: 'Device Two' }],
			}
			vi.mocked(parseSubscriptionVectorInfoFromOptions).mockReturnValue(mockVectorOptions)
			vi.mocked(setMultipleChannelDeviceSubscriptions).mockResolvedValue({ data: {} })

			await actions.subscribeMultiChannel!.callback({ options: {} } as any, {} as any)

			expect(parseSubscriptionVectorInfoFromOptions).toHaveBeenCalled()
			expect(setMultipleChannelDeviceSubscriptions).toHaveBeenCalledWith(self, mockVectorOptions)
		})

		it('learn function should return updated options based on device state', () => {
			const learn = actions.subscribeMultiChannel!.learn
			expect(learn).toBeDefined()

			const initialOptions = {
				rxDevice: 'device-1-id',
				'rxDeviceChannel-d1-rx1': 'ignore',
			}

			const learnedOptions = learn!({ options: initialOptions } as any, {} as any)

			// From mock data, device-1-id RX channel 1 is subscribed to 'TX 1@Device Two'
			const expectedLearnedValue = 'TX 1@Device Two'

			// Vitest can't resolve the dynamic key name so we manually check
			const learnedValue = Object.entries(learnedOptions as object).find(([key]) =>
				key.startsWith('rxDeviceChannel-d1-rx1'),
			)

			expect(learnedValue?.[1]).toEqual(expectedLearnedValue)
		})

		it('learn function should return clear for unsubscribed channels', () => {
			expect(actions?.subscribeMultiChannel).toBeDefined()
			const learn = actions.subscribeMultiChannel!.learn!

			const initialOptions = {
				rxDevice: 'device-1-id',
				'rxDeviceChannel-d1-rx2': 'ignore',
			}

			const learnedOptions = learn({ options: initialOptions } as any, {} as any)

			const learnedValue = Object.entries(learnedOptions as object).find(([key]) =>
				key.startsWith('rxDeviceChannel-d1-rx2'),
			)

			expect(learnedValue?.[1]).toEqual('clear')
		})
	})

	describe('setDestinationChannel', () => {
		it('should have correct name and options', () => {
			const action = actions.setDestinationChannel
			if (!action) {
				assert.fail('action not defined')
			}
			expect(action.name).toBe('Set Destination')
			expect(action.options.length).toBe(2)
		})

		it('callback should set a variable and update feedbacks', async () => {
			const action = actions.setDestinationChannel

			const mockAction = {
				options: {
					rxSelector: 'rx-selector-1',
					rx: '1@device-1-id',
				},
			}

			if (!action) {
				assert.fail('action not defined')
			}
			await action.callback(mockAction as any, {} as any)

			expect(self.variables['rx-selector-1']).toBe('1@device-1-id')
			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(self.setVariableValues).toHaveBeenCalledWith({ 'rx-selector-1': '1@device-1-id' })
			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(self.checkFeedbacks).toHaveBeenCalled()
		})

		it('callback should not set variable if options are missing', async () => {
			const action = actions.setDestinationChannel

			const mockAction = {
				options: {
					rxSelector: 'rx-selector-1',
					rx: undefined, // Missing rx value
				},
			}

			if (!action) {
				assert.fail('action not defined')
			}
			await action.callback(mockAction as any, {} as any)

			expect(self.variables['rx-selector-1']).toBeUndefined()
			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(self.setVariableValues).not.toHaveBeenCalled()
			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(self.checkFeedbacks).not.toHaveBeenCalled()
		})
	})
})
