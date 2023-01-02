import { gql } from '@apollo/client/core'
import { SetDeviceSubscriptionsMutation, SetDeviceSubscriptionsMutationVariables } from '../graphql-codegen/graphql'
import { AudinateDanteModule } from '../main'
import { ChannelSubscription } from '../options'

export const setDeviceSubscriptionsMutation = gql`
	mutation setDeviceSubscriptions($setDeviceSubscriptionsInput: SetDeviceSubscriptionsInput!) {
		setDeviceSubscriptions(input: $setDeviceSubscriptionsInput) {
			ok
		}
	}
`

export function setDeviceSubscriptions(self: AudinateDanteModule, subscription: ChannelSubscription) {
	return self.apolloClient.mutate<SetDeviceSubscriptionsMutation, SetDeviceSubscriptionsMutationVariables>({
		mutation: setDeviceSubscriptionsMutation,
		variables: {
			setDeviceSubscriptionsInput: {
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
