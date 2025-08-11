import {
	CompanionFeedbackDefinition,
	SomeCompanionFeedbackInputField,
	CompanionOptionValues,
} from '@companion-module/base'
import {
	getDropdownChoicesOfRxChannels,
	getDropdownChoicesOfTxChannels,
	parseSubscriptionInfoFromOptions,
} from '../options.js'
import { AudinateDanteModule } from '../main.js'
import { RxChannelSummary } from '../graphql-codegen/graphql.js'

export function getSubscriptionOptions(self: AudinateDanteModule): SomeCompanionFeedbackInputField[] {
	return [
		{
			id: 'rx',
			type: 'dropdown',
			label: 'Rx Channel@Device',
			default: 'Select a receive channel',
			choices: getDropdownChoicesOfRxChannels(self.domain),
			allowCustom: true,
			tooltip: 'The receiving channel to set the subscription on',
			isVisible: (o) => {
				return o['useSelector']?.valueOf() === false
			},
		},
		{
			id: 'rxSelector',
			type: 'dropdown',
			label: 'Rx Selector',
			default: 'rx-selector-1',
			choices: self.selectorChoices,
			tooltip: 'Use in combination with "set destination" actions',
			isVisible: (o) => {
				return o['useSelector']?.valueOf() === true
			},
		},
		{
			id: 'useSelector',
			type: 'checkbox',
			label: 'Use Rx Selector',
			default: false,
			tooltip: 'Use in combination with "set destination" actions',
		},
		{
			id: 'tx',
			type: 'dropdown',
			label: 'Tx Channel@Device',
			default: 'Select a transmit channel',
			choices: getDropdownChoicesOfTxChannels(self.domain),
			allowCustom: true,
			tooltip: 'The transmitting device to subscribe to',
		},
	]
}

/**
 * A shared callback function to check subscription status.
 * @param self The main module instance.
 * @param options The feedback options.
 * @param checkHealth Whether to check for a healthy connection.
 * @returns True if the subscription status matches the criteria.
 */
function checkSubscription(self: AudinateDanteModule, options: CompanionOptionValues, checkHealth: boolean): boolean {
	const { rxDeviceId, subscriptions } = parseSubscriptionInfoFromOptions(self, options) || {}

	if (!subscriptions || !subscriptions[0]) {
		return false
	}
	const { rxChannelIndex, subscribedDevice, subscribedChannel } = subscriptions[0]

	if (!rxDeviceId || !rxChannelIndex || !subscribedDevice || !subscribedChannel) {
		return false
	}

	const currentRxDevice = self.domain?.devices?.find((rxDevice) => rxDevice?.id === rxDeviceId)
	const currentRxChannel = currentRxDevice?.rxChannels?.find((rxChannel) => rxChannel?.index === Number(rxChannelIndex))

	if (!currentRxDevice || !currentRxChannel) {
		return false
	}

	const isCurrentlySubscribed =
		currentRxChannel?.subscribedDevice === subscribedDevice && currentRxChannel?.subscribedChannel === subscribedChannel

	if (checkHealth) {
		return isCurrentlySubscribed && currentRxChannel?.summary === RxChannelSummary.Connected
	}

	return isCurrentlySubscribed
}

/**
 * Creates a feedback definition to check if a subscription is in place.
 * The subscription may not be healthy (e.g., audio may not be passing).
 * @param self The main module instance.
 * @returns A CompanionFeedbackDefinition object.
 */
export function isSubscribed(self: AudinateDanteModule): CompanionFeedbackDefinition {
	return {
		name: 'isSubscribed',
		description: 'Is the specified channel subscription already in place (may not be healthy)',
		type: 'boolean',
		defaultStyle: {
			// Yellow
			bgcolor: parseInt('BBBB00', 16),
		},
		options: getSubscriptionOptions(self),
		callback: (feedback) => {
			return checkSubscription(self, feedback.options, false)
		},
	}
}

/**
 * Creates a feedback definition to check if a subscription is in place and healthy.
 * A healthy subscription means the devices are connected and audio should be passing.
 * @param self The main module instance.
 * @returns A CompanionFeedbackDefinition object.
 */
export function isSubscribedAndHealthy(self: AudinateDanteModule): CompanionFeedbackDefinition {
	return {
		name: 'isSubscribedAndHealthy',
		description: 'Is the specified channel subscription already in place and healthy',
		type: 'boolean',
		defaultStyle: {
			// Green
			bgcolor: parseInt('00CC00', 16),
		},
		options: getSubscriptionOptions(self),
		callback: (feedback) => {
			return checkSubscription(self, feedback.options, true)
		},
	}
}
