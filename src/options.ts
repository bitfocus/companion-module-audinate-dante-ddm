import { CompanionOptionValues } from '@companion-module/base'
import { AudinateDanteModule } from './main.js'

export interface ChannelSubscription {
	rxChannelIndex: string
	rxDeviceId: string
	txChannelName: string
	txDeviceName: string
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
