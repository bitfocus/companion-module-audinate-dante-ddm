import { CompanionOptionValues } from '@companion-module/base'
import { AudinateDanteModule } from './main'

export interface ChannelSubscription {
	rxChannelIndex: string
	rxDeviceId: string
	txChannelName: string
	txDeviceName: string
}

export function parseSubscriptionInfoFromOptions(
	self: AudinateDanteModule,
	options: CompanionOptionValues
): ChannelSubscription {
	let { rx, tx, useSelector, rxSelector } = options
	// console.log(util.inspect(self.domain, { depth: null, colors: true }))

	if (useSelector) {
		if (!rxSelector || typeof rxSelector !== 'string') {
			return
		}
		rx = self.getVariableValue(rxSelector)
	}

	if (!rx || typeof rx !== 'string') {
		return null
	}

	if (!tx || typeof tx !== 'string') {
		return null
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
