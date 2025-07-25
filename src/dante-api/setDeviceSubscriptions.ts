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
		if (result.errors) {
			self.log('error', JSON.stringify(result.errors))
			return
		}
		self.log(
			'debug',
			`setDeviceSubscription returned successfully for RX = ${subscription.rxChannelIndex} and TX =${subscription.txChannelName}`,
		)
		return result
	} catch (e) {
		if (e instanceof Error) {
			self.log('error', `${e.message} for RX = ${subscription.rxChannelIndex} and TX =${subscription.txChannelName}`)
		}
		self.log(
			'error',
			`${JSON.stringify(e)} for RX = ${subscription.rxChannelIndex} and TX =${subscription.txChannelName}`,
		)
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
		if (result.errors) {
			self.log('error', JSON.stringify(result.errors))
			return
		}

		self.log(
			'debug',
			`setMultipleChannelDeviceSubscriptions returned successfully for multi-channel subscription for ${subscription.deviceId}`,
		)
		return result
	} catch (e) {
		if (e instanceof Error) {
			self.log('error', `${e.message} for multi-channel subscription for ${subscription.deviceId}`)
		}
		self.log('error', `${JSON.stringify(e)} for multi-channel subscription for ${subscription.deviceId}`)
		return
	}
}
