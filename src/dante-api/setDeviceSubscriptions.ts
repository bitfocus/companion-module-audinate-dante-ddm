// eslint-disable-next-line n/no-missing-import
import { FetchResult, gql } from '@apollo/client/core/index.js'
import {
	DeviceRxChannelsSubscriptionSetMutation,
	DeviceRxChannelsSubscriptionSetMutationVariables,
} from '../graphql-codegen/graphql.js'
import { AudinateDanteModule } from '../main.js'
import { DanteSubscription } from '../options.js'

export const DeviceRxChannelsSubscriptionSet = gql`
	mutation DeviceRxChannelsSubscriptionSet($input: DeviceRxChannelsSubscriptionSetInput!) {
		DeviceRxChannelsSubscriptionSet(input: $input) {
			ok
		}
	}
`

export async function setDeviceSubscriptions(
	self: AudinateDanteModule,
	subscription: DanteSubscription,
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
					subscriptions: subscription.subscriptions,
				},
			},
		})

		self.log(
			'debug',
			`setDeviceSubscription returned successfully for multi-channel subscription for ${subscription.rxDeviceId}`,
		)
		return result
	} catch (e) {
		if (e instanceof Error) {
			self.log('error', `${e.message} for dante subscription for ${subscription.rxDeviceId}`)
		}
		self.log('error', `${JSON.stringify(e)} for dante subscription for ${subscription.rxDeviceId}`)
		return
	}
}
