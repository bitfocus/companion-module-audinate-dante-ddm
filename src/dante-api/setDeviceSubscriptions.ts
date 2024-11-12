import { gql } from '@apollo/client/core'
import {
	DeviceRxChannelsSubscriptionSetMutation,
	DeviceRxChannelsSubscriptionSetMutationVariables,
} from '../graphql-codegen/graphql'
import { AudinateDanteModule } from '../main'
import { ChannelSubscription } from '../options'

export const DeviceRxChannelsSubscriptionSet = gql`
	mutation DeviceRxChannelsSubscriptionSet($input: DeviceRxChannelsSubscriptionSetInput!) {
		DeviceRxChannelsSubscriptionSet(input: $input) {
			ok
		}
	}
`

export async function setDeviceSubscriptions(self: AudinateDanteModule, subscription: ChannelSubscription) {
	try {
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
			self.log('error', result.errors.toString())
			return undefined
		}
		self.log('debug', 'setDeviceSubscription returned successfully')
		return result
	} catch (e) {
		if (e instanceof Error) {
			self.log('error', e.message)
		}
		self.log('error', JSON.stringify(e))
		return
	}
}
