// eslint-disable-next-line n/no-missing-import
import { FetchResult, gql } from '@apollo/client/core/index.js'
import {
	DeviceRxChannelsSubscriptionSetMutation,
	DeviceRxChannelsSubscriptionSetMutationVariables,
} from '../graphql-codegen/graphql.js'
import { AudinateDanteModule } from '../main.js'
import { ChannelSubscription, MultipleChannelSubscription } from '../options.js'

export const DeviceRxChannelsSubscriptionSet = gql`
	mutation DeviceRxChannelsSubscriptionSet($input: DeviceRxChannelsSubscriptionSetInput!) {
		DeviceRxChannelsSubscriptionSet(input: $input) {
			ok
		}
	}
`

export async function setDeviceSubscriptions(
	self: AudinateDanteModule,
	subscription: ChannelSubscription,
): Promise<FetchResult<DeviceRxChannelsSubscriptionSetMutation> | undefined> {
	try {
		if (!self.apolloClient) {
			self.log('error', 'Apollo Client is not initialized')
			return
		}
		const result = await self.apolloClient.mutate<
			DeviceRxChannelsSubscriptionSetMutation,
			DeviceRxChannelsSubscriptionSetMutationVariables
		>({
			mutation: DeviceRxChannelsSubscriptionSet,
			variables: {
				input: {
					deviceId: subscription.rxDeviceId,
					subscriptions: [
						{
							rxChannelIndex: Number(subscription.rxChannelIndex),
							subscribedDevice: subscription.txDeviceName,
							subscribedChannel: subscription.txChannelName,
						},
					],
				},
			},
		})

		self.log(
			'debug',
			`setDeviceSubscription returned successfully for RX = ${subscription.rxChannelIndex} and TX =${subscription.txChannelName}`,
		)
		return result
	} catch (e) {
		if (e instanceof Error) {
			self.log('error', `setDeviceSubscriptions for ${subscription.rxDeviceId}: ${e.message}`)
			self.log('debug', JSON.stringify(e, null, 2))
		}
		return
	}
}

export async function setMultipleChannelDeviceSubscriptions(
	self: AudinateDanteModule,
	subscription: MultipleChannelSubscription,
): Promise<FetchResult<DeviceRxChannelsSubscriptionSetMutation> | undefined> {
	try {
		if (!self.apolloClient) {
			self.log('error', 'Apollo Client is not initialized')
			return
		}
		const result = await self.apolloClient.mutate<
			DeviceRxChannelsSubscriptionSetMutation,
			DeviceRxChannelsSubscriptionSetMutationVariables
		>({
			mutation: DeviceRxChannelsSubscriptionSet,
			variables: {
				input: {
					deviceId: subscription.deviceId,
					subscriptions: subscription.subscriptions,
				},
			},
		})

		self.log(
			'debug',
			`setMultipleChannelDeviceSubscriptions returned successfully for multi-channel subscription for ${subscription.deviceId}`,
		)
		return result
	} catch (e) {
		if (e instanceof Error) {
			self.log('error', `setMultipleChannelDeviceSubscriptions for ${subscription.deviceId}: ${e.message}`)
			self.log('debug', JSON.stringify(e, null, 2))
		}
		return
	}
}
