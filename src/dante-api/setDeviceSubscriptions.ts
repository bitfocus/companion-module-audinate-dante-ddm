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

export function setDeviceSubscriptions(self: AudinateDanteModule, subscription: ChannelSubscription) {
	return self.apolloClient.mutate<
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
}
