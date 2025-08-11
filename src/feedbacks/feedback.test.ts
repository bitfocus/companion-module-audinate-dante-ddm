// eslint-disable-next-line n/no-unpublished-import
import { describe, it, expect, vi, beforeEach, assert } from 'vitest'
import { AudinateDanteModule } from '../main.js' // Assuming this is the type location

import { parseSubscriptionInfoFromOptions, parseSubscriptionVectorInfoFromOptions } from '../options.js'
import { CompanionFeedbackDefinitions } from '@companion-module/base'
import generateFeedbacks from './feedbacks.js'
import { RxChannelSummary } from '../graphql-codegen/graphql.js'

const createMockSelf = (): AudinateDanteModule =>
	({
		domain: {
			devices: [
				{
					id: 'device-1-id',
					name: 'Device One',
					rxChannels: [
						{
							id: 'd1-rx1',
							index: 1,
							name: 'RX 1',
							subscribedChannel: 'TX 1',
							subscribedDevice: 'Device Two',
							summary: RxChannelSummary.Connected,
						},
						{
							id: 'd1-rx2',
							index: 2,
							name: 'RX 2',
							subscribedChannel: 'TX 2',
							subscribedDevice: 'Device Two',
							summary: RxChannelSummary.InProgress,
						},
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
					txChannels: [
						{ id: 'd2-tx1', index: 1, name: 'TX 1' },
						{ id: 'd2-tx2', index: 2, name: 'TX 2' },
					],
				},
			],
		},
		selectorChoices: [
			{
				id: 'rx-selector-1',
				label: 'Selector #1',
			},
			{
				id: 'rx-selector-2',
				label: 'Selector #2',
			},
			{
				id: 'rx-selector-3',
				label: 'Selector #3',
			},
			{
				id: 'rx-selector-4',
				label: 'Selector #4',
			},
		],
		variables: {},
		log: vi.fn(),
		setVariableValues: vi.fn(),
		checkFeedbacks: vi.fn(),
	}) as unknown as AudinateDanteModule

vi.mock('../options.js', async () => {
	const actual = await vi.importActual('../options.js')
	return {
		...actual,
		parseSubscriptionInfoFromOptions: vi.fn(),
		parseSubscriptionVectorInfoFromOptions: vi.fn(),
		// TODO this is different, try commenting it out
		getDropdownChoicesOfDevices: vi.fn().mockReturnValue([
			{
				id: 'device-1-id',
				label: 'Device One',
			},
			{
				id: 'device-2-id',
				label: 'Device Two',
			},
		]),
	}
})

describe('generateFeedbacks', () => {
	let self: AudinateDanteModule
	let feedbacks: CompanionFeedbackDefinitions

	beforeEach(() => {
		vi.clearAllMocks()
		self = createMockSelf()
		feedbacks = generateFeedbacks(self)
		self.variables = {}
	})

	it('Should return five feedbacks with correct names', () => {
		expect(Object.keys(feedbacks)).toEqual([
			'isSubscribed',
			'isSubscribedAndHealthy',
			'isSubscribedMultiChannel',
			'isSubscribedMultiChannelAndHealthy',
			'isSelected',
		])
	})

	describe('isSubscribed', () => {
		it('should have correct name and options', () => {
			const feedback = feedbacks.isSubscribed
			expect(feedback).toBeDefined()
			expect(feedback?.name).toBe('isSubscribed')
			expect(feedback?.options.length).toBe(4)
		})

		it('should generate the right options for the dropdowns', () => {
			expect(feedbacks?.isSubscribed).toBeDefined()
			const rxOption = feedbacks.isSubscribed!.options.find((opt) => opt.id === 'rx')
			const txOption = feedbacks.isSubscribed!.options.find((opt) => opt.id === 'tx')
			const rxSelectorActual = feedbacks.isSubscribed?.options.find((opt) => opt.id === 'rxSelector')
			const useSelectorActual = feedbacks.isSubscribed?.options.find((opt) => opt.id === 'useSelector')

			const expectedRxChoices = [
				{ id: '1@device-1-id', label: 'RX 1@Device One' },
				{ id: '2@device-1-id', label: 'RX 2@Device One' },
				{ id: '1@device-2-id', label: 'RX 1@Device Two' },
			]
			const expectedTxChoices = [
				{ id: 'TX 1@Device One', label: 'TX 1@Device One' },
				{ id: 'TX 2@Device One', label: 'TX 2@Device One' },
				{ id: 'TX 1@Device Two', label: 'TX 1@Device Two' },
				{ id: 'TX 2@Device Two', label: 'TX 2@Device Two' },
			]
			const rxSelector = [1, 2, 3, 4].map((s) => ({
				id: `rx-selector-${s}`,
				label: `Selector #${s}`,
			}))

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

			if (rxSelectorActual && rxSelectorActual.type === 'dropdown') {
				expect(rxSelectorActual.choices).toEqual(rxSelector)
			} else {
				assert.fail('rxSelectorActual is not a dropdown or is undefined')
			}

			expect(useSelectorActual).toBeDefined()
		})

		it('callback should return true when channels are subscribed', async () => {
			const mockOptions = {
				rxDeviceId: 'device-1-id',
				subscriptions: [
					{
						rxChannelIndex: 1,
						subscribedChannel: 'TX 1',
						subscribedDevice: 'Device Two',
					},
				],
			}
			vi.mocked(parseSubscriptionInfoFromOptions).mockReturnValue(mockOptions)
			const result = await feedbacks.isSubscribed?.callback({ options: {} } as any, {} as any)
			expect(parseSubscriptionInfoFromOptions).toHaveBeenCalled()
			expect(result).toBeTruthy()
		})

		it('callback should return true when channels are not subscribed', async () => {
			const mockOptions = {
				rxDeviceId: 'device-1-id',
				subscriptions: [
					{
						rxChannelIndex: 2,
						subscribedChannel: 'TX 1',
						subscribedDevice: 'Device Two',
					},
				],
			}
			vi.mocked(parseSubscriptionInfoFromOptions).mockReturnValue(mockOptions)
			const result = await feedbacks.isSubscribed?.callback({ options: {} } as any, {} as any)
			expect(parseSubscriptionInfoFromOptions).toHaveBeenCalled()
			expect(result).toBeFalsy()
		})

		it('callback should return false when channels do not exist', async () => {
			const mockOptions = {
				rxDeviceId: 'device-1-id',
				subscriptions: [
					{
						rxChannelIndex: 30,
						subscribedChannel: 'TX 1',
						subscribedDevice: 'Device Two',
					},
				],
			}
			vi.mocked(parseSubscriptionInfoFromOptions).mockReturnValue(mockOptions)
			const result = await feedbacks.isSubscribed?.callback({ options: {} } as any, {} as any)
			expect(parseSubscriptionInfoFromOptions).toHaveBeenCalled()
			expect(result).toBeFalsy()
		})
	})
	describe('isSubscribedAndHealthy', () => {
		it('should have correct name and options', () => {
			const feedback = feedbacks.isSubscribedAndHealthy
			expect(feedback).toBeDefined()
			expect(feedback?.name).toBe('isSubscribedAndHealthy')
			expect(feedback?.options.length).toBe(4)
		})

		it('callback should return true when channels are subscribed and healthy', async () => {
			const mockOptions = {
				rxDeviceId: 'device-1-id',
				subscriptions: [
					{
						rxChannelIndex: 1,
						subscribedChannel: 'TX 1',
						subscribedDevice: 'Device Two',
					},
				],
			}
			vi.mocked(parseSubscriptionInfoFromOptions).mockReturnValue(mockOptions)
			const result = await feedbacks.isSubscribed?.callback({ options: {} } as any, {} as any)
			expect(parseSubscriptionInfoFromOptions).toHaveBeenCalled()
			expect(result).toBeTruthy()
		})

		it('callback should return true when channels are subscribed but unhealthy', async () => {
			const mockOptions = {
				rxDeviceId: 'device-1-id',
				subscriptions: [
					{
						rxChannelIndex: 2,
						subscribedChannel: 'TX 1',
						subscribedDevice: 'Device Two',
					},
				],
			}
			vi.mocked(parseSubscriptionInfoFromOptions).mockReturnValue(mockOptions)
			const result = await feedbacks.isSubscribed?.callback({ options: {} } as any, {} as any)
			expect(parseSubscriptionInfoFromOptions).toHaveBeenCalled()
			expect(result).toBeFalsy()
		})
	})
	describe('isSubscribedMultiChannel', () => {
		it('should have correct name and options', () => {
			const feedback = feedbacks.isSubscribedMultiChannel
			expect(feedback).toBeDefined()
			expect(feedback?.name).toBe('isSubscribedMultiChannel')
			expect(feedback?.options.length).toBe(5)
		})

		it('should have correct name and dynamic options', () => {
			const feedback = feedbacks.isSubscribedMultiChannel
			if (!feedback) {
				assert.fail('"isSubscribedMultiChannel" action is not defined')
				return
			}

			expect(feedback.name).toBe('isSubscribedMultiChannel')
			const rxDeviceOption = feedback.options.find((opt) => opt.id === 'rxDevice')

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

		it('callback isSubscribedMultiChannel with parsed options returns false if subscriptions are not set', async () => {
			const mockVectorOptions = {
				rxDeviceId: 'device-1-id',
				subscriptions: [
					{ rxChannelIndex: 1, subscribedChannel: 'TX 1', subscribedDevice: 'Device Two' },
					{ rxChannelIndex: 2, subscribedChannel: 'TX 1', subscribedDevice: 'Device Two' },
				],
			}
			vi.mocked(parseSubscriptionVectorInfoFromOptions).mockReturnValue(mockVectorOptions)

			const result = await feedbacks.isSubscribedMultiChannel!.callback({ options: {} } as any, {} as any)

			expect(parseSubscriptionVectorInfoFromOptions).toHaveBeenCalled()
			expect(result).toBe(false)
		})

		it('callback isSubscribedMultiChannel with parsed options returns true if subscriptions are not set', async () => {
			const mockVectorOptions = {
				rxDeviceId: 'device-1-id',
				subscriptions: [
					{ rxChannelIndex: 1, subscribedChannel: 'TX 1', subscribedDevice: 'Device Two' },
					{ rxChannelIndex: 2, subscribedChannel: 'TX 2', subscribedDevice: 'Device Two' },
				],
			}
			vi.mocked(parseSubscriptionVectorInfoFromOptions).mockReturnValue(mockVectorOptions)

			const result = await feedbacks.isSubscribedMultiChannel!.callback({ options: {} } as any, {} as any)

			expect(parseSubscriptionVectorInfoFromOptions).toHaveBeenCalled()
			expect(result).toBe(true)
		})
	})
	describe('isSubscribedMultiChannelAndHealthy', () => {
		it('should have correct name and options', () => {
			const feedback = feedbacks.isSubscribedMultiChannelAndHealthy
			expect(feedback).toBeDefined()
			expect(feedback?.name).toBe('isSubscribedMultiChannelAndHealthy')
			expect(feedback?.options.length).toBe(5)
		})

		it('callback isSubscribedMultiChannelAndHealthy returns false if subscriptions are not healthy', async () => {
			const mockVectorOptions = {
				rxDeviceId: 'device-1-id',
				subscriptions: [
					{ rxChannelIndex: 1, subscribedChannel: 'TX 1', subscribedDevice: 'Device Two' },
					{ rxChannelIndex: 2, subscribedChannel: 'TX 2', subscribedDevice: 'Device Two' },
				],
			}
			vi.mocked(parseSubscriptionVectorInfoFromOptions).mockReturnValue(mockVectorOptions)

			const result = await feedbacks.isSubscribedMultiChannelAndHealthy!.callback({ options: {} } as any, {} as any)

			expect(parseSubscriptionVectorInfoFromOptions).toHaveBeenCalled()
			expect(result).toBe(false)
		})

		it('callback isSubscribedMultiChannelAndHealthy returns true if subscriptions are not healthy', async () => {
			const mockVectorOptions = {
				rxDeviceId: 'device-1-id',
				subscriptions: [
					{ rxChannelIndex: 1, subscribedChannel: 'TX 1', subscribedDevice: 'Device Two' },
					{ rxChannelIndex: 2, subscribedChannel: 'ignore', subscribedDevice: 'ignore' },
				],
			}
			vi.mocked(parseSubscriptionVectorInfoFromOptions).mockReturnValue(mockVectorOptions)

			const result = await feedbacks.isSubscribedMultiChannelAndHealthy!.callback({ options: {} } as any, {} as any)

			expect(parseSubscriptionVectorInfoFromOptions).toHaveBeenCalled()
			expect(result).toBe(true)
		})
	})
	// describe('isSelected')
})
