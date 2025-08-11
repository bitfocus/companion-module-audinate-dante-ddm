import { CompanionInputFieldDropdown, CompanionOptionValues, DropdownChoice } from '@companion-module/base'
import { AudinateDanteModule } from './main.js'
import { DomainQuery, DomainsQuery, RxChannel } from './graphql-codegen/graphql.js'

export interface DanteSubscription {
	rxDeviceId: string
	subscriptions: SubscribedDevice[]
}

export interface SubscribedDevice {
	rxChannelIndex: number
	subscribedDevice: string
	subscribedChannel: string
}

/**
 * @description Generates a list of all available domains that are accessible by
 * the user.
 * The list is formatted to be suitable to use in in Dropdown menu options
 */
export function getDropdownChoicesOfDomains(domains?: DomainsQuery['domains']): DropdownChoice[] {
	return [
		{ id: 'default', label: 'None' },
		...(domains?.map((d) => {
			if (d && d.id && d.name) {
				return {
					id: d.id,
					label: d.name,
				}
			}
			return { id: '', label: '' }
		}) ?? []),
	]
}

/**
 * @description Generates a list of all available devices in the domain
 * The list is formatted to be suitable to use in in Dropdown menu options
 */
export function getDropdownChoicesOfDevices(domain: DomainQuery['domain']): DropdownChoice[] {
	// Use .filter(Boolean) to remove any null entries produced by the map
	const deviceChoices =
		domain?.devices
			?.map((d) => {
				if (d && d.id && d.name) {
					return {
						id: d.id,
						label: d.name,
					}
				}
				return null
			})
			.filter((c) => c !== null) ?? []

	return [{ id: 'default', label: 'None' }, ...deviceChoices]
}

/**
 * @description Generates a list of all available transmit channels in the domain
 * The list is formatted to be suitable to use in in Dropdown menu options
 */
export function getDropdownChoicesOfTxChannels(domain: DomainQuery['domain']): DropdownChoice[] {
	return (
		domain?.devices?.flatMap(
			(d) =>
				d?.txChannels?.reduce<DropdownChoice[]>((acc, txChannel) => {
					// Only add a choice if both the device and channel are valid
					if (txChannel && d) {
						acc.push({
							id: `${txChannel.name}@${d.name}`,
							label: `${txChannel.name}@${d.name}`,
						})
					}
					return acc
				}, []) ?? [],
		) ?? []
	)
}

/**
 * @description Generates a list of all available receive channels in the domain
 * The list is formatted to be suitable to use in in Dropdown menu options
 */
export function getDropdownChoicesOfRxChannels(domain: DomainQuery['domain']): DropdownChoice[] {
	return (
		domain?.devices?.flatMap(
			(d) =>
				d?.rxChannels?.reduce<DropdownChoice[]>((acc, rxChannel) => {
					// Only add a choice if both the device and channel are valid
					if (rxChannel && d) {
						acc.push({
							id: `${rxChannel.index}@${d.id}`,
							label: `${rxChannel.name}@${d.name}`,
						})
					}
					return acc
				}, []) ?? [],
		) ?? []
	)
}

/**
 * @description Helper function to build the dropdown choices for a single Rx Channel
 * Results will be either:
 *  - clear
 *  - ignore
 *  - a subscription in the form `{txChannel}@{txDevice}`
 */
export function buildRxChannelSubscriptionDropdown(
	domain: DomainQuery['domain'],
	rxChannel: RxChannel,
): CompanionInputFieldDropdown | undefined {
	if (!rxChannel) {
		return undefined
	}
	const defaultOption =
		rxChannel.subscribedChannel === '' && rxChannel.subscribedDevice === ''
			? 'clear'
			: `${rxChannel.subscribedChannel}@${rxChannel.subscribedDevice}`

	return {
		id: `rxDeviceChannel-${rxChannel.id}`,
		type: 'dropdown',
		label: `${rxChannel.index}: ${rxChannel.name}`,
		default: defaultOption,
		choices: [
			{ id: 'clear', label: 'Clear Subscription' },
			{ id: 'ignore', label: 'Ignore This Channel' },
			...getDropdownChoicesOfTxChannels(domain),
		],
	}
}

/**
 * @description Helper function to generate an option for each Rx channel in the
 * device and show its subscription status
 */
export function buildListOfDropdownsForRxChannelSubscriptions(
	domain: DomainQuery['domain'],
): CompanionInputFieldDropdown[] {
	return (
		domain?.devices
			?.flatMap((d) => {
				if (!d?.rxChannels) {
					return undefined
				}
				// For each Rx Channel of a device, create a dropdown
				return d.rxChannels.map((rxChannel) => {
					if (!rxChannel) {
						return undefined
					}
					const deviceId = d.id
					return <CompanionInputFieldDropdown>{
						...buildRxChannelSubscriptionDropdown(domain, rxChannel),
						// This option should only be visible when its parent device is selected
						isVisible: (o, data) => {
							return o['rxDevice']?.valueOf() === data.deviceId
						},
						isVisibleData: { deviceId },
					}
				})
			})
			.filter((device) => device !== undefined) ?? []
	)
}

// ------------------------------------------------
// ------------------- Parsers --------------------
// ------------------------------------------------

export function parseSubscriptionVectorInfoFromOptions(options: CompanionOptionValues): DanteSubscription | null {
	const { rxDevice } = options

	if (!rxDevice || typeof rxDevice !== 'string') {
		return null
	}
	const subscriptions: SubscribedDevice[] = Object.entries(options)
		.map(([key, value]) => {
			if (typeof value !== 'string') {
				return null
			}
			const rxChannel = key.split(`rxChannel`)
			if (rxChannel.length < 2) {
				return null
			}
			if (!rxChannel[0].includes(rxDevice)) {
				return null
			}
			const rxChannelIndex = parseInt(rxChannel[1].split(`:`)[1], 10)
			let [subscribedChannel, subscribedDevice] = value.split(`@`)

			if (subscribedChannel === `ignore`) {
				return null
			}
			if (subscribedChannel === `clear`) {
				subscribedChannel = ``
				subscribedDevice = ``
			}
			return {
				rxChannelIndex: rxChannelIndex,
				subscribedDevice: subscribedDevice,
				subscribedChannel: subscribedChannel,
			}
		})
		.filter((channelSubscription) => channelSubscription !== null)

	return {
		rxDeviceId: rxDevice,
		subscriptions,
	}
}

/*
 * Gathers information about the subscription from options either using direct values or from variables (if using selectors)
 */
export function parseSubscriptionInfoFromOptions(
	self: AudinateDanteModule,
	options: CompanionOptionValues,
): DanteSubscription | null {
	let { rx, tx } = options
	const { useSelector, rxSelector } = options

	if (useSelector) {
		if (!rxSelector || typeof rxSelector !== 'string') {
			return null
		}
		rx = self.getVariableValue(rxSelector)
	}

	if (!rx || typeof rx !== 'string') {
		return null
	}

	if (!tx || typeof tx !== 'string') {
		// unsubscribe
		tx = '@'
	}

	const [rxChannelIndexStr, rxDeviceId] = rx.toString().split('@')
	const [txChannelName, txDeviceName] = tx.toString().split('@')

	const rxChannelIndex = parseInt(rxChannelIndexStr, 10)

	return {
		rxDeviceId,
		subscriptions: [
			{
				rxChannelIndex,
				subscribedDevice: txDeviceName,
				subscribedChannel: txChannelName,
			},
		],
	}
}
