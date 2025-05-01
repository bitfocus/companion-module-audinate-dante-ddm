import { CompanionOptionValues } from '@companion-module/base'
import { AudinateDanteModule } from './main.js'

export interface ChannelSubscription {
	rxChannelIndex: string
	rxDeviceId: string
	txChannelName: string
	txDeviceName: string
}

export interface MultipleChannelSubscription {
	deviceId: string
	subscriptions: SubscribedDevice[]
}

export interface SubscribedDevice {
	rxChannelIndex: number
	subscribedDevice: string
	subscribedChannel: string
}

export function parseSubscriptionVectorInfoFromOptions(
	options: CompanionOptionValues,
): MultipleChannelSubscription | null {
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

			if (subscribedChannel === `noChange`) {
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
		deviceId: rxDevice,
		subscriptions,
	}
}

/*
 * Gathers information about the subscription from options either using direct values or from variables (if using selectors)
 */
export function parseSubscriptionInfoFromOptions(
	self: AudinateDanteModule,
	options: CompanionOptionValues,
): ChannelSubscription | null {
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

	const [rxChannelIndex, rxDeviceId] = rx.toString().split('@')
	const [txChannelName, txDeviceName] = tx.toString().split('@')

	return {
		rxChannelIndex,
		rxDeviceId,
		txChannelName,
		txDeviceName,
	}
}
