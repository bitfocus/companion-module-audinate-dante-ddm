// // eslint-disable-next-line n/no-unpublished-import
// import { describe, bench } from 'vitest'
// import { buildListOfDropdownsForRxChannelSubscriptions } from './options.js'
import { DomainQuery, DomainsQuery, RxChannelSummary } from './graphql-codegen/graphql.js'

export const getMockDomains = (): DomainsQuery['domains'] => {
	return [
		{
			id: `mock-domain`,
			name: `mock-domain-test`,
		},
	]
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getMockDevices = () => {
	// --- Configuration
	const NUM_DEVICES = 250
	const NUM_CHANNELS_PER_DEVICE = 8

	// --- Data Generation ---
	const generatedDevices = []

	for (let i = 0; i < NUM_DEVICES; i++) {
		const deviceId = `device-${i}-id`
		const deviceName = `Device ${i}`

		const rxChannels = []
		const txChannels = []

		for (let j = 0; j < NUM_CHANNELS_PER_DEVICE; j++) {
			// Add a receiver channel
			rxChannels.push({
				id: `d${i}-rx${j}`,
				index: j,
				name: `RX ${j}`,
				subscribedChannel: `TX ${j}`,
				subscribedDevice: `Some Other Device`,
				// Cycle through summary states for variety
				summary: j % 2 === 0 ? RxChannelSummary.Connected : RxChannelSummary.InProgress,
			})

			// Add a transmitter channel
			txChannels.push({
				id: `d${i}-tx${j}`,
				index: j,
				name: `TX ${j}`,
			})
		}

		generatedDevices.push({
			id: deviceId,
			name: deviceName,
			rxChannels,
			txChannels,
		})
	}
	return generatedDevices
}

export const getMockDomain = (): DomainQuery['domain'] => {
	return {
		id: 'mock-load-test-domain',
		name: 'Stadium',
		devices: getMockDevices(),
	}
}
// // The final mock object
// const benchDomain = {
// 	devices: getMockDevices(),
// } as DomainQuery['domain'] // Cast to assert type correctness

// describe('options generators', () => {
// 	bench('buildListOfDropdownsForRxChannelSubscriptions', () => {
// 		buildListOfDropdownsForRxChannelSubscriptions(benchDomain)
// 	})
// })
