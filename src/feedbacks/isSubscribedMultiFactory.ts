import {
	CompanionFeedbackDefinition,
	CompanionOptionValues,
	SomeCompanionFeedbackInputField,
} from '@companion-module/base'
import { AudinateDanteModule } from '../main.js'
import { RxChannelSummary } from '../graphql-codegen/graphql.js'
import {
	getDropdownChoicesOfDevices,
	parseSubscriptionVectorInfoFromOptions,
	buildListOfDropdownsForRxChannelSubscriptions,
} from '../options.js'

export function getOptions(self: AudinateDanteModule): SomeCompanionFeedbackInputField[] {
	return [
		{
			id: 'rxDevice',
			type: 'dropdown',
			label: 'Rx Device',
			default: self.domain?.devices?.[0]?.id ?? '',
			choices: getDropdownChoicesOfDevices(self.domain),
			tooltip: 'The receiving device to set the subscriptions on',
		},
		{
			id: 'rxChannelsHeader',
			label: 'Rx Channel Subscriptions',
			tooltip: 'Define the required subscriptions for the channels of the selected device',
			type: 'static-text',
			value: '',
		},
		...buildListOfDropdownsForRxChannelSubscriptions(self.domain),
	]
}

export function checkSubscriptionHealth(
	self: AudinateDanteModule,
	options: CompanionOptionValues,
	checkHealth: boolean,
): boolean {
	const { rxDeviceId, subscriptions } = parseSubscriptionVectorInfoFromOptions(options) || {}
	if (!rxDeviceId || !subscriptions) {
		return false
	}

	const currentRxDevice = self.domain?.devices?.find((rxDevice) => rxDevice?.id === rxDeviceId)
	if (!currentRxDevice?.rxChannels || currentRxDevice?.rxChannels.length === 0) {
		return false
	}

	// Use .every() to ensure all checked subscriptions match the criteria
	return currentRxDevice.rxChannels.every((rxChannel) => {
		if (!rxChannel) return false

		const targetSubscription = subscriptions.find((sub) => sub.rxChannelIndex === rxChannel.index)

		// If the channel is ignored or not defined in the options, it doesn't affect the feedback state
		if (!targetSubscription || targetSubscription.subscribedChannel === 'ignore') {
			return true
		}

		// Check if the actual subscription matches the target subscription
		const isSubscribed =
			rxChannel.subscribedDevice === targetSubscription.subscribedDevice &&
			rxChannel.subscribedChannel === targetSubscription.subscribedChannel

		// If health check is disabled, or if it's enabled and the channel is healthy, this part is true
		const isHealthy =
			!checkHealth || // i.e. short-circuit / ignore if checkHealth is false
			rxChannel.summary === RxChannelSummary.Connected ||
			targetSubscription.subscribedChannel === '' // 'clear' is always considered healthy

		return isSubscribed && isHealthy
	})
}

export function getCurrentSubscriptions(
	self: AudinateDanteModule,
	options: CompanionOptionValues,
): CompanionOptionValues | undefined {
	const rxDeviceId = options.rxDevice
	if (!rxDeviceId || typeof rxDeviceId !== 'string') {
		return undefined
	}

	const currentRxDevice = self.domain?.devices?.find((d) => d?.id === rxDeviceId)
	const learnedOptions: CompanionOptionValues = {}

	// For the selected device, update each channel's dropdown to reflect its current subscription state
	currentRxDevice?.rxChannels?.forEach((rxChannel) => {
		if (!rxChannel) return

		const optionId = `rxDeviceChannel-${rxChannel.id}`
		const { subscribedChannel, subscribedDevice } = rxChannel

		if (subscribedDevice && subscribedChannel) {
			learnedOptions[optionId] = `${subscribedChannel}@${subscribedDevice}`
		} else {
			learnedOptions[optionId] = 'clear'
		}
	})

	return {
		...options,
		...learnedOptions,
	}
}

/**
 * Creates a feedback definition to check if a set of subscriptions are in place.
 *
 * The subscription may not be healthy (e.g., audio may not be passing).
 *
 * @param self The main module instance.
 * @returns A CompanionFeedbackDefinition object.
 */
export function isSubscribedMultiChannel(self: AudinateDanteModule): CompanionFeedbackDefinition {
	const options = getOptions(self)
	return {
		name: 'isSubscribedMultiChannel',
		description:
			'Checks if the specified multi-channel subscriptions are in place. Use "Ignore" to exclude a channel from the check.',
		type: 'boolean',
		defaultStyle: {
			bgcolor: parseInt('BBBB00', 16), // Yellow
		},
		options,
		callback: (feedback) => {
			const checkHealth = false
			return checkSubscriptionHealth(self, feedback.options, checkHealth)
		},
		learn: (feedback) => {
			return getCurrentSubscriptions(self, feedback.options)
		},
	}
}

/**
 * Creates a feedback definition to check if a set of subscriptions are in place and healthy.
 * A healthy subscription means the devices are connected and audio should be passing on all relevant channels
 * @param self The main module instance.
 * @returns A CompanionFeedbackDefinition object.
 */
export function isSubscribedMultiChannelAndHealthy(self: AudinateDanteModule): CompanionFeedbackDefinition {
	const options = getOptions(self)
	return {
		name: 'isSubscribedMultiChannelAndHealthy',
		description: 'Checks if the specified multi-channel subscriptions are in place and healthy (Connected).',
		type: 'boolean',
		defaultStyle: {
			bgcolor: parseInt('00CC00', 16), // Green
		},
		options,
		callback: (feedback) => {
			const checkHealth = true
			return checkSubscriptionHealth(self, feedback.options, checkHealth)
		},
		learn: (feedback) => {
			return getCurrentSubscriptions(self, feedback.options)
		},
	}
}
