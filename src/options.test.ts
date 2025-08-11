// eslint-disable-next-line n/no-unpublished-import
import { describe, it, expect, vi } from 'vitest'
import {
	getDropdownChoicesOfDomains,
	getDropdownChoicesOfDevices,
	getDropdownChoicesOfTxChannels,
	getDropdownChoicesOfRxChannels,
	buildRxChannelSubscriptionDropdown,
	buildListOfDropdownsForRxChannelSubscriptions,
	parseSubscriptionVectorInfoFromOptions,
	parseSubscriptionInfoFromOptions,
} from './options.js'
import { Domain, DomainQuery, DomainsQuery, RxChannel } from './graphql-codegen/graphql.js'
import { CompanionOptionValues } from '@companion-module/base'
import { AudinateDanteModule } from './main.js'

// Mock for RxChannelSummary enum as it's not defined in the provided files
const RxChannelSummary = {
	Connected: 'CONNECTED',
	InProgress: 'IN_PROGRESS',
	NotConnected: 'NOT_CONNECTED',
}

// Mock data based on GraphQL schemas
const mockDomains: DomainsQuery['domains'] = [
	{ id: 'domain-1', name: 'Main Campus' },
	{ id: 'domain-2', name: 'Studio Complex' },
]

// Updated mockDomain as requested
const mockDomain: DomainQuery['domain'] = {
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
			rxChannels: [{ id: 'd2-rx1', index: 1, name: 'RX 1', subscribedChannel: 'TX 1', subscribedDevice: 'Device One' }],
			txChannels: [
				{ id: 'd2-tx1', index: 1, name: 'TX 1' },
				{ id: 'd2-tx2', index: 2, name: 'TX 2' },
			],
		},
	],
} as DomainQuery['domain'] // Cast to assert type correctness

// Mock for AudinateDanteModule instance
const createMockSelf = (): AudinateDanteModule =>
	({
		getVariableValue: vi.fn(),
		log: vi.fn(),
	}) as unknown as AudinateDanteModule

describe('options.ts', () => {
	describe('getDropdownChoicesOfDomains', () => {
		it('should return a formatted list of domains', () => {
			const choices = getDropdownChoicesOfDomains(mockDomains)
			expect(choices).toEqual([
				{ id: 'default', label: 'None' },
				{ id: 'domain-1', label: 'Main Campus' },
				{ id: 'domain-2', label: 'Studio Complex' },
			])
		})

		it('should handle an empty domains array', () => {
			const choices = getDropdownChoicesOfDomains([])
			expect(choices).toEqual([{ id: 'default', label: 'None' }])
		})

		it('should handle undefined input', () => {
			const choices = getDropdownChoicesOfDomains(undefined)
			expect(choices).toEqual([{ id: 'default', label: 'None' }])
		})
	})

	describe('getDropdownChoicesOfDevices', () => {
		it('should return a formatted list of devices', () => {
			const choices = getDropdownChoicesOfDevices(mockDomain)
			expect(choices).toEqual([
				{ id: 'default', label: 'None' },
				{ id: 'device-1-id', label: 'Device One' },
				{ id: 'device-2-id', label: 'Device Two' },
			])
		})

		it('should handle a domain with no devices', () => {
			const choices = getDropdownChoicesOfDevices(<Domain>{
				...mockDomain,
				devices: null,
			})
			expect(choices).toEqual([{ id: 'default', label: 'None' }])
		})

		it('should handle undefined input', () => {
			const choices = getDropdownChoicesOfDevices(undefined)
			expect(choices).toEqual([{ id: 'default', label: 'None' }])
		})
	})

	describe('getDropdownChoicesOfTxChannels', () => {
		it('should return a flat list of all Tx channels in the domain', () => {
			const choices = getDropdownChoicesOfTxChannels(mockDomain)
			expect(choices).toEqual([
				{ id: 'TX 1@Device One', label: 'TX 1@Device One' },
				{ id: 'TX 2@Device One', label: 'TX 2@Device One' },
				{ id: 'TX 1@Device Two', label: 'TX 1@Device Two' },
				{ id: 'TX 2@Device Two', label: 'TX 2@Device Two' },
			])
		})

		it('should return an empty array if there are no devices', () => {
			const choices = getDropdownChoicesOfTxChannels(<Domain>{
				...mockDomain,
				devices: null,
			})
			expect(choices).toEqual([])
		})

		it('should return an empty array for undefined input', () => {
			const choices = getDropdownChoicesOfTxChannels(undefined)
			expect(choices).toEqual([])
		})
	})

	describe('getDropdownChoicesOfRxChannels', () => {
		it('should return a flat list of all Rx channels in the domain', () => {
			const choices = getDropdownChoicesOfRxChannels(mockDomain)
			expect(choices).toEqual([
				{ id: '1@device-1-id', label: 'RX 1@Device One' },
				{ id: '2@device-1-id', label: 'RX 2@Device One' },
				{ id: '1@device-2-id', label: 'RX 1@Device Two' },
			])
		})

		it('should return an empty array if there are no devices', () => {
			const choices = getDropdownChoicesOfRxChannels(<Domain>{
				...mockDomain,
				devices: null,
			})
			expect(choices).toEqual([])
		})

		it('should return an empty array for undefined input', () => {
			const choices = getDropdownChoicesOfRxChannels(undefined)
			expect(choices).toEqual([])
		})
	})

	describe('buildRxChannelSubscriptionDropdown', () => {
		it('should build a dropdown for a subscribed channel', () => {
			const rxChannel = mockDomain?.devices?.[0]?.rxChannels?.[0] as RxChannel
			const dropdown = buildRxChannelSubscriptionDropdown(mockDomain, rxChannel)
			expect(dropdown).toBeDefined()
			expect(dropdown?.id).toBe('rxDeviceChannel-d1-rx1')
			expect(dropdown?.label).toBe('1: RX 1')
		})

		it('should set default to "clear" for an unsubscribed channel', () => {
			const unsubscribedChannel: RxChannel = {
				id: 'd1-rx3',
				index: 3,
				name: 'RX 3',
				subscribedChannel: '',
				subscribedDevice: '',
			}
			const dropdown = buildRxChannelSubscriptionDropdown(mockDomain, unsubscribedChannel)
			expect(dropdown?.default).toBe('clear')
		})

		it('should return undefined if the rxChannel is invalid', () => {
			const dropdown = buildRxChannelSubscriptionDropdown(mockDomain, undefined as unknown as RxChannel)
			expect(dropdown).toBeUndefined()
		})
	})

	describe('buildListOfDropdownsForRxChannelSubscriptions', () => {
		it('should create a list of dropdowns for all Rx channels', () => {
			const dropdowns = buildListOfDropdownsForRxChannelSubscriptions(mockDomain)
			// 3 valid Rx channels in mock data
			expect(dropdowns).toHaveLength(3)

			// Check visibility data on the first one
			const firstDropdown = dropdowns[0]
			expect(firstDropdown.id).toBe('rxDeviceChannel-d1-rx1')
			expect(firstDropdown.isVisibleData).toEqual({ deviceId: 'device-1-id' })

			// Test the isVisible function
			const isVisibleFn = firstDropdown.isVisible as (
				options: CompanionOptionValues,
				data: { deviceId: string },
			) => boolean
			expect(isVisibleFn({ rxDevice: 'device-1-id' }, { deviceId: 'device-1-id' })).toBe(true)
			expect(isVisibleFn({ rxDevice: 'device-2-id' }, { deviceId: 'device-1-id' })).toBe(false)
		})

		it('should return an empty array for a domain with no devices', () => {
			const dropdowns = buildListOfDropdownsForRxChannelSubscriptions(<Domain>{})
			expect(dropdowns).toEqual([])
		})
	})

	describe('parseSubscriptionVectorInfoFromOptions', () => {
		it('should parse options into a MultipleChannelSubscription object', () => {
			const options: CompanionOptionValues = {
				rxDevice: 'device-1-id',
				'rxDevice:device-1-id:rxChannel1:1': 'TX 1@Device Two',
				'rxDevice:device-1-id:rxChannel2:2': 'clear',
				'rxDevice:device-1-id:rxChannel3:3': 'ignore',
				'otherDevice:rxChannel1:1': 'someVal', // Should be ignored
			}

			const result = parseSubscriptionVectorInfoFromOptions(options)
			expect(result).toEqual({
				rxDeviceId: 'device-1-id',
				subscriptions: [
					{ rxChannelIndex: 1, subscribedDevice: 'Device Two', subscribedChannel: 'TX 1' },
					{ rxChannelIndex: 2, subscribedDevice: '', subscribedChannel: '' },
				],
			})
		})

		it('should return null if rxDevice is missing', () => {
			const options: CompanionOptionValues = {}
			expect(parseSubscriptionVectorInfoFromOptions(options)).toBeNull()
		})

		it('should handle cases with no valid channel subscriptions', () => {
			const options: CompanionOptionValues = {
				rxDevice: 'device-1-id',
				'rxDevice:device-1-id:rxChannel1:1': 'ignore',
			}
			const result = parseSubscriptionVectorInfoFromOptions(options)
			expect(result?.subscriptions).toEqual([])
		})
	})

	describe('parseSubscriptionInfoFromOptions', () => {
		const self = createMockSelf()

		it('should parse standard rx and tx options', () => {
			const options: CompanionOptionValues = {
				rx: '1@device-rx-id',
				tx: 'Audio 1@device-tx-id',
			}
			const result = parseSubscriptionInfoFromOptions(self, options)
			expect(result).toEqual({
				rxDeviceId: 'device-rx-id',
				subscriptions: [
					{
						rxChannelIndex: 1,
						subscribedChannel: 'Audio 1',
						subscribedDevice: 'device-tx-id',
					},
				],
			})
		})

		it('should handle unsubscribe when tx is missing', () => {
			const options: CompanionOptionValues = { rx: '2@device-rx-id' }
			const result = parseSubscriptionInfoFromOptions(self, options)
			expect(result).toEqual({
				rxDeviceId: 'device-rx-id',
				subscriptions: [
					{
						rxChannelIndex: 2,
						subscribedChannel: '',
						subscribedDevice: '',
					},
				],
			})
		})

		it('should use selector when useSelector is true', () => {
			const options: CompanionOptionValues = {
				useSelector: true,
				rxSelector: 'variable-id',
				tx: 'Mic 2@Console',
			}
			const self = createMockSelf()
			const getVariableValueMock = vi.fn().mockReturnValue('4@selected-device-id')
			self.getVariableValue = getVariableValueMock

			const result = parseSubscriptionInfoFromOptions(self, options)
			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(self.getVariableValue).toHaveBeenCalledWith('variable-id')
			expect(result).toEqual({
				rxDeviceId: 'selected-device-id',
				subscriptions: [
					{
						rxChannelIndex: 4,
						subscribedChannel: 'Mic 2',
						subscribedDevice: 'Console',
					},
				],
			})
		})

		it('should return null if useSelector is true but rxSelector is missing', () => {
			const options: CompanionOptionValues = { useSelector: true, tx: 'Mic 2@Console' }
			expect(parseSubscriptionInfoFromOptions(self, options)).toBeNull()
		})

		it('should return null if rx is missing and not using selector', () => {
			const options: CompanionOptionValues = { tx: 'Mic 2@Console' }
			expect(parseSubscriptionInfoFromOptions(self, options)).toBeNull()
		})
	})
})
