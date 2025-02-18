/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never }
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: { input: string; output: string }
	String: { input: string; output: string }
	Boolean: { input: boolean; output: boolean }
	Int: { input: number; output: number }
	Float: { input: number; output: number }
	/** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
	DateTime: { input: any; output: any }
}

export type Capabilities = {
	__typename?: 'Capabilities'
	CAN_UNICAST_CLOCKING?: Maybe<Scalars['Boolean']['output']>
	CAN_WRITE_EXT_WORD_CLOCK?: Maybe<Scalars['Boolean']['output']>
	CAN_WRITE_PREFERRED_MASTER?: Maybe<Scalars['Boolean']['output']>
	CAN_WRITE_SLAVE_ONLY?: Maybe<Scalars['Boolean']['output']>
	CAN_WRITE_UNICAST_DELAY_REQUESTS?: Maybe<Scalars['Boolean']['output']>
	id: Scalars['ID']['output']
	mediaTypes?: Maybe<Scalars['Int']['output']>
}

export enum ChannelMediaType {
	All = 'ALL',
	Ancillary = 'ANCILLARY',
	Audio = 'AUDIO',
	Generic = 'GENERIC',
	Undefined = 'UNDEFINED',
	Video = 'VIDEO',
}

export type ClockPreferences = {
	__typename?: 'ClockPreferences'
	externalWordClock?: Maybe<Scalars['Boolean']['output']>
	id: Scalars['ID']['output']
	leader?: Maybe<Scalars['Boolean']['output']>
	overrides?: Maybe<DeviceOverrides>
	unicastClocking?: Maybe<Scalars['Boolean']['output']>
	v1UnicastDelayRequests?: Maybe<Scalars['Boolean']['output']>
}

export enum ClockSyncServo {
	/** if a device's servo is in sync or a grand leader for uuidV2 */
	Locked = 'LOCKED',
	/** if a device is online and servo is not in ( sync or a grand leader for uuidV2 ) */
	NotLocked = 'NOT_LOCKED',
	/**
	 * if a device is offline (this UNKNOWN is not the same as unknown enum in clockServo or servo state,
	 *   we cannot distinguish unknown and none in ddm side, dante model cpp api has NONE value
	 * )
	 */
	Unknown = 'UNKNOWN',
}

export type ClockingState = {
	__typename?: 'ClockingState'
	followerWithoutLeader?: Maybe<Scalars['Boolean']['output']>
	frequencyOffset?: Maybe<Scalars['String']['output']>
	grandLeader?: Maybe<Scalars['Boolean']['output']>
	id: Scalars['ID']['output']
	locked?: Maybe<ClockSyncServo>
	multicastLeader?: Maybe<Scalars['Boolean']['output']>
	muteStatus?: Maybe<Scalars['String']['output']>
	unicastFollower?: Maybe<Scalars['Boolean']['output']>
	unicastLeader?: Maybe<Scalars['Boolean']['output']>
}

export enum ConnectionState {
	Disconnected = 'DISCONNECTED',
	Established = 'ESTABLISHED',
	Ready = 'READY',
}

export type Device = {
	__typename?: 'Device'
	capabilities?: Maybe<Capabilities>
	clockPreferences?: Maybe<ClockPreferences>
	clockingState?: Maybe<ClockingState>
	comments?: Maybe<Scalars['String']['output']>
	connection?: Maybe<DeviceConnection>
	description?: Maybe<Scalars['String']['output']>
	domain?: Maybe<Domain>
	domainId?: Maybe<Scalars['ID']['output']>
	enrolmentState?: Maybe<EnrolmentState>
	id: Scalars['ID']['output']
	identity?: Maybe<Identity>
	interfaces?: Maybe<Array<Maybe<Interface>>>
	location?: Maybe<Scalars['String']['output']>
	manufacturer?: Maybe<Manufacturer>
	name: Scalars['String']['output']
	picture?: Maybe<Scalars['String']['output']>
	platform?: Maybe<Platform>
	product?: Maybe<Product>
	rxChannels?: Maybe<Array<Maybe<RxChannel>>>
	txChannels?: Maybe<Array<Maybe<TxChannel>>>
}

export type DeviceClockingUnicastSetInput = {
	deviceId: Scalars['ID']['input']
	enabled: Scalars['Boolean']['input']
}

export type DeviceClockingUnicastSetPayload = MutationResponse & {
	__typename?: 'DeviceClockingUnicastSetPayload'
	ok: Scalars['Boolean']['output']
}

export type DeviceConnection = {
	__typename?: 'DeviceConnection'
	id: Scalars['ID']['output']
	lastChanged?: Maybe<Scalars['DateTime']['output']>
	state?: Maybe<ConnectionState>
}

export type DeviceOverrides = {
	__typename?: 'DeviceOverrides'
	id: Scalars['ID']['output']
	ptp?: Maybe<DevicePtp>
	rtp?: Maybe<DeviceRtp>
}

export type DevicePtp = {
	__typename?: 'DevicePtp'
	id: Scalars['ID']['output']
	v2Priority1?: Maybe<Scalars['Int']['output']>
	v2Priority2?: Maybe<Scalars['Int']['output']>
}

export type DeviceRtp = {
	__typename?: 'DeviceRtp'
	id: Scalars['ID']['output']
	prefixV4?: Maybe<Scalars['Int']['output']>
}

export type DeviceRxChannelsSubscriptionInput = {
	/**
	 * The channel number on the device which will receive the subscription
	 *
	 * Examples:
	 *   - 1
	 *   - 19
	 *
	 * Channel numbers start at 1
	 *
	 * This index is unique on the given device and is not media specific.
	 * The index to use should be determined by first querying the channels on the device, finding the channel you want to modify, and then use that index.
	 */
	rxChannelIndex: Scalars['Int']['input']
	/**
	 * The channel name on the device which is transmitting the media
	 *
	 * Channel *labels* are used in Dante (rather than IDs) so that the the subscription will
	 * follow the channel of that label, rather than a specific channel of that ID.
	 * This allows the transmitting device rearrange it's transmit channels,
	 * without needing to update the subscriptions on receiving devices.
	 *
	 * Examples:
	 *   "Audio L"
	 *   "CH1"
	 *   "01"
	 *
	 * 💡 An empty subscribedDevice and subscribedChannel will unsubscribe the channel
	 */
	subscribedChannel: Scalars['String']['input']
	/**
	 * The name of the device which is transmitting the media that you wish to subscribe to
	 *
	 * Device *names* are used in Dante subscriptions (rather than IDs) so that the the subscription will
	 * follow a device of that name, rather than a specific device of that ID.
	 * This allows the transmitting device to be swapped out for a device of the same name.
	 *
	 * Example: "AVIOAO2-51f9e7"
	 *
	 * 💡 An empty subscribedDevice and subscribedChannel will unsubscribe the channel
	 */
	subscribedDevice: Scalars['String']['input']
}

export type DeviceRxChannelsSubscriptionSetInput = {
	/**
	 * Allows setting a subscription to a channel name even when the transmitter device does not have a channel by that name
	 *
	 * Subscriptions to unknown devices or channels may be helpful when restoring a preset.
	 *
	 * Dante resolves subscriptions by name, so this is a valid configuration. However, the subscription will remain unresolved until the transmitter device has a channel by this name.
	 *
	 * If this value is set to true, then additional checks (such as checking the media types of each channel match) will not be performed.
	 */
	allowSubscriptionToNonExistentChannel?: InputMaybe<Scalars['Boolean']['input']>
	/**
	 * Allows setting a subscription to a device name when that device does not currently exist, typically because it is offline.
	 *
	 * Subscriptions to unknown devices may be helpful when restoring a preset.
	 *
	 * Dante resolves subscriptions by name, so this is a valid configuration. However, the subscription will remain unresolved until the transmitter device is online.
	 *
	 * If set, 'allowSubscriptionToNonExistentChannel' must also be set since the channel name cannot resolve when the device is offline
	 */
	allowSubscriptionToNonExistentDevice?: InputMaybe<Scalars['Boolean']['input']>
	/**
	 * The ID of the device which will receive the subscription
	 *
	 * Examples:
	 *   "0ae3b2edf1374c0c836c96649e879c2f" (for software devices like DVS)
	 *   "001dc1fffe501c25:0" (for hardware devices like AVIO)
	 */
	deviceId: Scalars['ID']['input']
	subscriptions: Array<DeviceRxChannelsSubscriptionInput>
}

export type DeviceRxChannelsSubscriptionSetPayload = MutationResponse & {
	__typename?: 'DeviceRxChannelsSubscriptionSetPayload'
	ok: Scalars['Boolean']['output']
}

export type DevicesEnrollInput = {
	/**
	 * Clear Configuration will reset the following configuration settings to the device defaults:
	 *   - Device Name
	 *   - Channel labels
	 *   - Latency
	 *   - Sample rate
	 *   - Encoding
	 *   - Subscriptions
	 * Note: Clear Configuration is not supported for legacy devices.
	 */
	clearConfig?: InputMaybe<Scalars['Boolean']['input']>
	deviceIds: Array<Scalars['ID']['input']>
	domainId: Scalars['ID']['input']
}

export type DevicesEnrollPayload = MutationResponse & {
	__typename?: 'DevicesEnrollPayload'
	ok: Scalars['Boolean']['output']
}

export type DevicesUnenrollInput = {
	/**
	 * Clear Configuration will reset the following configuration settings to the device defaults:
	 *   - Device Name
	 *   - Channel labels
	 *   - Latency
	 *   - Sample rate
	 *   - Encoding
	 *   - Subscriptions
	 * Note: Clear Configuration is not supported for legacy devices.
	 */
	clearConfig?: InputMaybe<Scalars['Boolean']['input']>
	deviceIds: Array<Scalars['ID']['input']>
}

export type DevicesUnenrollPayload = MutationResponse & {
	__typename?: 'DevicesUnenrollPayload'
	ok: Scalars['Boolean']['output']
}

export type Domain = {
	__typename?: 'Domain'
	clockingGroupId?: Maybe<Scalars['ID']['output']>
	device?: Maybe<Device>
	devices?: Maybe<Array<Maybe<Device>>>
	icon?: Maybe<DomainIcon>
	id: Scalars['ID']['output']
	legacyInterop?: Maybe<Scalars['Boolean']['output']>
	name?: Maybe<Scalars['String']['output']>
}

export type DomainDeviceArgs = {
	id: Scalars['ID']['input']
}

export enum DomainIcon {
	ArtsVenue = 'ARTS_VENUE',
	BarClub = 'BAR_CLUB',
	Broadcast = 'BROADCAST',
	Commercial = 'COMMERCIAL',
	Government = 'GOVERNMENT',
	HealthCare = 'HEALTH_CARE',
	HigherEducation = 'HIGHER_EDUCATION',
	HotelCasino = 'HOTEL_CASINO',
	HouseOfWorship_1 = 'HOUSE_OF_WORSHIP_1',
	HouseOfWorship_2 = 'HOUSE_OF_WORSHIP_2',
	Manufacturing = 'MANUFACTURING',
	Office = 'OFFICE',
	Other = 'OTHER',
	PrimaryEducation = 'PRIMARY_EDUCATION',
	RecordingStudio = 'RECORDING_STUDIO',
	Residential_1 = 'RESIDENTIAL_1',
	Residential_2 = 'RESIDENTIAL_2',
	Restaurant = 'RESTAURANT',
	Retail = 'RETAIL',
	SportsVenue_1 = 'SPORTS_VENUE_1',
	SportsVenue_2 = 'SPORTS_VENUE_2',
	TheatreCinema = 'THEATRE_CINEMA',
	ThemedEntertainment = 'THEMED_ENTERTAINMENT',
	Transportation_1 = 'TRANSPORTATION_1',
	Transportation_2 = 'TRANSPORTATION_2',
}

export enum EnrolmentState {
	ChangingDomain = 'CHANGING_DOMAIN',
	Enrolled = 'ENROLLED',
	Enrolling = 'ENROLLING',
	Unenrolled = 'UNENROLLED',
	Unenrolling = 'UNENROLLING',
}

export type Identity = {
	__typename?: 'Identity'
	/** The name given to the device by the user. Example: 'Foyer' */
	actualName?: Maybe<Scalars['String']['output']>
	/**
	 * The name given to the device (actualName) which may be appended with a numeric identifier if  a device of the same actualName already exists. Example: 'Foyer (2)'
	 * @deprecated Not used in managed environments. Use device.name
	 */
	advertisedName?: Maybe<Scalars['String']['output']>
	danteHardwareVersion?: Maybe<Scalars['String']['output']>
	danteVersion?: Maybe<Scalars['String']['output']>
	/** The name that the device will have when it is unboxed or factory reset. Typically contains the MAC address. Example: 'AVIOAO2-51f9e7' */
	defaultName?: Maybe<Scalars['String']['output']>
	id: Scalars['ID']['output']
	instanceId: Scalars['ID']['output']
	/** @deprecated Use manufacturer.id */
	manufacturerId?: Maybe<Scalars['String']['output']>
	/** @deprecated Use manufacturer.name */
	manufacturerName?: Maybe<Scalars['String']['output']>
	productModelId?: Maybe<Scalars['String']['output']>
	productModelName?: Maybe<Scalars['String']['output']>
	productSoftwareVersion?: Maybe<Scalars['String']['output']>
	productVersion?: Maybe<Scalars['String']['output']>
}

export type Interface = {
	__typename?: 'Interface'
	address?: Maybe<Scalars['String']['output']>
	id: Scalars['ID']['output']
	macAddress?: Maybe<Scalars['String']['output']>
	netmask?: Maybe<Scalars['Int']['output']>
	subnet?: Maybe<Scalars['String']['output']>
}

/**
 * The Manufacturer of a device or software.
 *
 * Examples: "Acme Incorporated"
 *
 * See also: Product
 */
export type Manufacturer = {
	__typename?: 'Manufacturer'
	id: Scalars['ID']['output']
	name: Scalars['String']['output']
}

export type Mutation = {
	__typename?: 'Mutation'
	DeviceClockingUnicastSet?: Maybe<DeviceClockingUnicastSetPayload>
	DeviceRxChannelsSubscriptionSet?: Maybe<DeviceRxChannelsSubscriptionSetPayload>
	DevicesEnroll?: Maybe<DevicesEnrollPayload>
	DevicesUnenroll?: Maybe<DevicesUnenrollPayload>
}

export type MutationDeviceClockingUnicastSetArgs = {
	input: DeviceClockingUnicastSetInput
}

export type MutationDeviceRxChannelsSubscriptionSetArgs = {
	input: DeviceRxChannelsSubscriptionSetInput
}

export type MutationDevicesEnrollArgs = {
	input: DevicesEnrollInput
}

export type MutationDevicesUnenrollArgs = {
	input: DevicesUnenrollInput
}

export type MutationResponse = {
	ok: Scalars['Boolean']['output']
}

/**
 * The device Platform describes the Dante Platform that the device is built upon.
 *
 * This is the Audinate product used *inside* the manufacturers Product. See also: Product
 *
 * Examples: Brooklyn 2, Ultimo, DEP, etc.
 *
 * This section will be extended with additional information about the Platform as required. Examples include
 *   - Icon
 *   - Latest available firmware version
 *   - Links to release notes
 *   - Capabilities
 */
export type Platform = {
	__typename?: 'Platform'
	id: Scalars['ID']['output']
	name: Scalars['String']['output']
}

/**
 * The device Product describes information about the manufactured product (that is, the device the end-user interacts with)
 *
 * This is the OEM product (ie. the outside of the box). See also: Platform and Manufacturer
 *
 * Examples include: "Amplifier 5000", "Mixer 900"
 *
 * This section will be extended with additional information about the Platform as required. Examples include
 *   - Icon
 *   - Latest available firmware version
 *   - Links to release notes
 *   - Capabilities
 */
export type Product = {
	__typename?: 'Product'
	/** The name of the product from the OEM */
	id: Scalars['ID']['output']
	name: Scalars['String']['output']
}

export type Query = {
	__typename?: 'Query'
	domain?: Maybe<Domain>
	domains: Array<Maybe<Domain>>
	unenrolledDevices: Array<Device>
}

export type QueryDomainArgs = {
	id?: InputMaybe<Scalars['ID']['input']>
	name?: InputMaybe<Scalars['String']['input']>
}

export type RxChannel = {
	__typename?: 'RxChannel'
	enabled?: Maybe<Scalars['Boolean']['output']>
	/** A unique identifier for the channel, used for caching purposes. Use 'index' when displaying to users */
	id: Scalars['ID']['output']
	/**
	 * The channel number, starting at 1.
	 *
	 * Examples:
	 *   - 1
	 *   - 19
	 *
	 * This index is unique on the given device and is not media specific.
	 */
	index: Scalars['Int']['output']
	mediaType?: Maybe<ChannelMediaType>
	/** The name of the channel */
	name?: Maybe<Scalars['String']['output']>
	status?: Maybe<RxChannelStatus>
	statusMessage?: Maybe<Scalars['String']['output']>
	/** The Tx channel name on the the device that this channel is subscribed to */
	subscribedChannel?: Maybe<Scalars['String']['output']>
	/** The device name of the device that this channel is subscribed to */
	subscribedDevice?: Maybe<Scalars['String']['output']>
	summary?: Maybe<RxChannelSummary>
}

export enum RxChannelStatus {
	/**
	 * Error: Flow formats do not match,
	 * e.g. Multicast flow with more slots than receiving device can handle
	 */
	BundleFormat = 'BUNDLE_FORMAT',
	/** Error: Channel formats do not match */
	ChannelFormat = 'CHANNEL_FORMAT',
	/** Error: Tx channel latency higher than maximum supported Rx latency */
	ChannelLatency = 'CHANNEL_LATENCY',
	/** Error: Tx and Rx and in different clock subdomains */
	ClockDomain = 'CLOCK_DOMAIN',
	/** Active subscription to an automatically configured source flow */
	Dynamic = 'DYNAMIC',
	/** Error: can't find suitable protocol for dynamic connection */
	DynamicProtocol = 'DYNAMIC_PROTOCOL',
	/** Error: HDCP key negotiation failed */
	HdcpNegotiationFailed = 'HDCP_NEGOTIATION_FAILED',
	/**
	 * A flow has been configured but does not have sufficient information to
	 * establish an audio connection.
	 *
	 * For example, configuring a template with no associations.
	 */
	Idle = 'IDLE',
	/** Error: Channel does not exist (eg no such local channel) */
	InvalidChannel = 'INVALID_CHANNEL',
	/** Error: Transmitter rejected the bundle request as invalid */
	InvalidMsg = 'INVALID_MSG',
	/** Channel Name has been found and processed; setting up flow. This is an transient state */
	InProgress = 'IN_PROGRESS',
	/** Manual flow configuration bypassing the standard subscription process */
	Manual = 'MANUAL',
	/** No subscription for this channel */
	None = 'NONE',
	/**
	 * Error: The name was found but the connection process failed
	 * (the receiver could not communicate with the transmitter)
	 */
	NoConnection = 'NO_CONNECTION',
	/** Error: Receiver is out of resources (e.g. flows) */
	NoRx = 'NO_RX',
	/** Error: Transmitter is out of resources (e.g. flows) */
	NoTx = 'NO_TX',
	/** Error: Receiver got a QoS failure (too much data) when setting up the flow. */
	QosFailRx = 'QOS_FAIL_RX',
	/** Error: Transmitter got a QoS failure (too much data) when setting up the flow. */
	QosFailTx = 'QOS_FAIL_TX',
	/** Channel Name has been found, but not yet processed. This is an transient state before the flow is created */
	Resolved = 'RESOLVED',
	/** Error: Channel Name explicitly does not exist on this network */
	ResolvedNone = 'RESOLVED_NONE',
	/** Error: an error occurred while trying to resolve the channel name */
	ResolveFail = 'RESOLVE_FAIL',
	/** Error: Receiver couldn't set up the flow */
	RxFail = 'RX_FAIL',
	/** Error: All Rx links are down */
	RxLinkDown = 'RX_LINK_DOWN',
	/** Error: There is an external issue with Rx */
	RxNotReady = 'RX_NOT_READY',
	/** Error: Rx device does not have a supported subscription mode (unicast/multicast) available */
	RxUnsupportedSubMode = 'RX_UNSUPPORTED_SUB_MODE',
	/** Active subscription to a manually configured source flow */
	Static = 'STATIC',
	/** Channel is successfully subscribed to own TX channels (local loopback mode) */
	SubscribeSelf = 'SUBSCRIBE_SELF',
	/** Error: The given subscription to self was disallowed by the device */
	SubscribeSelfPolicy = 'SUBSCRIBE_SELF_POLICY',
	/** Error: Unexpected system failure */
	SystemFail = 'SYSTEM_FAIL',
	/** Error: Template-based subscription failed: the unicast template is full */
	TemplateFull = 'TEMPLATE_FULL',
	/**
	 * Error: Template-based subscription failed: something else about the template configuration
	 * made it impossible to complete the subscription using the given flow
	 */
	TemplateMismatchConfig = 'TEMPLATE_MISMATCH_CONFIG',
	/** Error: Template-based subscription failed: template and subscription device names don't match */
	TemplateMismatchDevice = 'TEMPLATE_MISMATCH_DEVICE',
	/** Error: Template-based subscription failed: flow and channel formats don't match */
	TemplateMismatchFormat = 'TEMPLATE_MISMATCH_FORMAT',
	/** Error: Template-based subscription failed: the channel is not part of the given multicast flow */
	TemplateMissingChannel = 'TEMPLATE_MISSING_CHANNEL',
	/** Error: Tx access control denied the request */
	TxAccessControlDenied = 'TX_ACCESS_CONTROL_DENIED',
	/** Tx access control request is in progress */
	TxAccessControlPending = 'TX_ACCESS_CONTROL_PENDING',
	/** Error: Rx device does not support the signal encryption */
	TxChannelEncrypted = 'TX_CHANNEL_ENCRYPTED',
	/** Error: Transmitter couldn't set up the flow */
	TxFail = 'TX_FAIL',
	/** Error: Tx device cannot support additional unicast flows */
	TxFanoutLimitReached = 'TX_FANOUT_LIMIT_REACHED',
	/** Error: All Tx links are down */
	TxLinkDown = 'TX_LINK_DOWN',
	/** Error: There is an external issue with Tx */
	TxNotReady = 'TX_NOT_READY',
	/** Error: Tx rejected the address given by rx (usually indicates an ARP failure) */
	TxRejectedAddr = 'TX_REJECTED_ADDR',
	/** Error: Unexpected response from TX device */
	TxResponseUnexpected = 'TX_RESPONSE_UNEXPECTED',
	/** Error: Tx Scheduler failure */
	TxSchedulerFailure = 'TX_SCHEDULER_FAILURE',
	/** Error: Tx device does not have a supported subscription mode (unicast/multicast) available */
	TxUnsupportedSubMode = 'TX_UNSUPPORTED_SUB_MODE',
	/** Channel Name not yet found on network */
	Unresolved = 'UNRESOLVED',
	/** Error: Attempt to use an unsupported feature */
	Unsupported = 'UNSUPPORTED',
}

export enum RxChannelSummary {
	Connected = 'CONNECTED',
	Error = 'ERROR',
	InProgress = 'IN_PROGRESS',
	None = 'NONE',
	Warning = 'WARNING',
}

/** A transmit channel of media (either audio or video) from a device */
export type TxChannel = {
	__typename?: 'TxChannel'
	id: Scalars['ID']['output']
	index: Scalars['Int']['output']
	mediaType?: Maybe<ChannelMediaType>
	name: Scalars['String']['output']
}

export type DomainQueryVariables = Exact<{
	domainIDInput: Scalars['ID']['input']
}>

export type DomainQuery = {
	__typename?: 'Query'
	domain?: {
		__typename?: 'Domain'
		id: string
		name?: string | null
		devices?: Array<{
			__typename?: 'Device'
			id: string
			name: string
			rxChannels?: Array<{
				__typename?: 'RxChannel'
				id: string
				index: number
				name?: string | null
				subscribedDevice?: string | null
				subscribedChannel?: string | null
				status?: RxChannelStatus | null
				summary?: RxChannelSummary | null
			} | null> | null
			txChannels?: Array<{ __typename?: 'TxChannel'; id: string; index: number; name: string } | null> | null
		} | null> | null
	} | null
}

export type DomainsQueryVariables = Exact<{ [key: string]: never }>

export type DomainsQuery = {
	__typename?: 'Query'
	domains: Array<{ __typename?: 'Domain'; id: string; name?: string | null } | null>
}

export type DeviceRxChannelsSubscriptionSetMutationVariables = Exact<{
	input: DeviceRxChannelsSubscriptionSetInput
}>

export type DeviceRxChannelsSubscriptionSetMutation = {
	__typename?: 'Mutation'
	DeviceRxChannelsSubscriptionSet?: { __typename?: 'DeviceRxChannelsSubscriptionSetPayload'; ok: boolean } | null
}

export const DomainDocument = {
	kind: 'Document',
	definitions: [
		{
			kind: 'OperationDefinition',
			operation: 'query',
			name: { kind: 'Name', value: 'Domain' },
			variableDefinitions: [
				{
					kind: 'VariableDefinition',
					variable: { kind: 'Variable', name: { kind: 'Name', value: 'domainIDInput' } },
					type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
				},
			],
			selectionSet: {
				kind: 'SelectionSet',
				selections: [
					{
						kind: 'Field',
						name: { kind: 'Name', value: 'domain' },
						arguments: [
							{
								kind: 'Argument',
								name: { kind: 'Name', value: 'id' },
								value: { kind: 'Variable', name: { kind: 'Name', value: 'domainIDInput' } },
							},
						],
						selectionSet: {
							kind: 'SelectionSet',
							selections: [
								{ kind: 'Field', name: { kind: 'Name', value: 'id' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'name' } },
								{
									kind: 'Field',
									name: { kind: 'Name', value: 'devices' },
									selectionSet: {
										kind: 'SelectionSet',
										selections: [
											{ kind: 'Field', name: { kind: 'Name', value: 'id' } },
											{ kind: 'Field', name: { kind: 'Name', value: 'name' } },
											{
												kind: 'Field',
												name: { kind: 'Name', value: 'rxChannels' },
												selectionSet: {
													kind: 'SelectionSet',
													selections: [
														{ kind: 'Field', name: { kind: 'Name', value: 'id' } },
														{ kind: 'Field', name: { kind: 'Name', value: 'index' } },
														{ kind: 'Field', name: { kind: 'Name', value: 'name' } },
														{ kind: 'Field', name: { kind: 'Name', value: 'subscribedDevice' } },
														{ kind: 'Field', name: { kind: 'Name', value: 'subscribedChannel' } },
														{ kind: 'Field', name: { kind: 'Name', value: 'status' } },
														{ kind: 'Field', name: { kind: 'Name', value: 'summary' } },
													],
												},
											},
											{
												kind: 'Field',
												name: { kind: 'Name', value: 'txChannels' },
												selectionSet: {
													kind: 'SelectionSet',
													selections: [
														{ kind: 'Field', name: { kind: 'Name', value: 'id' } },
														{ kind: 'Field', name: { kind: 'Name', value: 'index' } },
														{ kind: 'Field', name: { kind: 'Name', value: 'name' } },
													],
												},
											},
										],
									},
								},
							],
						},
					},
				],
			},
		},
	],
} as unknown as DocumentNode<DomainQuery, DomainQueryVariables>
export const DomainsDocument = {
	kind: 'Document',
	definitions: [
		{
			kind: 'OperationDefinition',
			operation: 'query',
			name: { kind: 'Name', value: 'Domains' },
			selectionSet: {
				kind: 'SelectionSet',
				selections: [
					{
						kind: 'Field',
						name: { kind: 'Name', value: 'domains' },
						selectionSet: {
							kind: 'SelectionSet',
							selections: [
								{ kind: 'Field', name: { kind: 'Name', value: 'id' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'name' } },
							],
						},
					},
				],
			},
		},
	],
} as unknown as DocumentNode<DomainsQuery, DomainsQueryVariables>
export const DeviceRxChannelsSubscriptionSetDocument = {
	kind: 'Document',
	definitions: [
		{
			kind: 'OperationDefinition',
			operation: 'mutation',
			name: { kind: 'Name', value: 'DeviceRxChannelsSubscriptionSet' },
			variableDefinitions: [
				{
					kind: 'VariableDefinition',
					variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
					type: {
						kind: 'NonNullType',
						type: { kind: 'NamedType', name: { kind: 'Name', value: 'DeviceRxChannelsSubscriptionSetInput' } },
					},
				},
			],
			selectionSet: {
				kind: 'SelectionSet',
				selections: [
					{
						kind: 'Field',
						name: { kind: 'Name', value: 'DeviceRxChannelsSubscriptionSet' },
						arguments: [
							{
								kind: 'Argument',
								name: { kind: 'Name', value: 'input' },
								value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
							},
						],
						selectionSet: {
							kind: 'SelectionSet',
							selections: [{ kind: 'Field', name: { kind: 'Name', value: 'ok' } }],
						},
					},
				],
			},
		},
	],
} as unknown as DocumentNode<DeviceRxChannelsSubscriptionSetMutation, DeviceRxChannelsSubscriptionSetMutationVariables>
