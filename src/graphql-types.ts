export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
};

/** The Account describes payment, and connection details etc. */
export type Account = {
  __typename?: 'Account';
  owner?: Maybe<User>;
  /** The subscription (payment etc.) */
  subscription?: Maybe<AccountSubscription>;
};

export type AccountSubscription = {
  __typename?: 'AccountSubscription';
  accountHolderEmail?: Maybe<Scalars['String']>;
  accountHolderName?: Maybe<Scalars['String']>;
  /** The account should be running and accessible */
  active?: Maybe<Scalars['Boolean']>;
  /** The internal customer ID */
  customerId?: Maybe<Scalars['String']>;
  /** The TCP port which DAPI clients (including Dante Controller) should connect on */
  dapiPort?: Maybe<Scalars['Int']>;
  /** The UDP port which Dante Devices should connect to */
  devicePort?: Maybe<Scalars['Int']>;
  /** The number of devices that may be enrolled in domains under this account */
  deviceSeats?: Maybe<Scalars['Int']>;
  /** The instance ID for this subscription. Internal use */
  instanceId?: Maybe<Scalars['Int']>;
  /** The account subscription is live subscription from Fastspring (as opposed to a test subscription) */
  live?: Maybe<Scalars['Boolean']>;
  nextChargeDate?: Maybe<Scalars['DateTime']>;
  nextChargeTotalInPayoutCurrencyDisplay?: Maybe<Scalars['String']>;
  /** If the instance is currently provisioned or not */
  provisioned?: Maybe<Scalars['Boolean']>;
  /** Where the subscription originated from */
  source?: Maybe<AccountSubscriptionSource>;
  state?: Maybe<AccountSubscriptionState>;
  subscriptionId: Scalars['String'];
  /** The friendly name of the current subscription. e.g. Dante Cloud Subscription (Monthly) */
  subscriptionTypeDisplay?: Maybe<Scalars['String']>;
};

export enum AccountSubscriptionSource {
  Fastspring = 'FASTSPRING',
  Manual = 'MANUAL'
}

export enum AccountSubscriptionState {
  Active = 'ACTIVE',
  Canceled = 'CANCELED',
  Deactivated = 'DEACTIVATED',
  Overdue = 'OVERDUE',
  Trial = 'TRIAL'
}

export type AddDomainInput = {
  icon: DomainIcon;
  name: Scalars['String'];
};

export type AddDomainPayload = MutationResponse & {
  __typename?: 'AddDomainPayload';
  domain?: Maybe<Domain>;
  ok: Scalars['Boolean'];
};

export type AddUserInput = {
  defaultRole?: InputMaybe<UserDomainRoles>;
  displayName?: InputMaybe<Scalars['String']>;
  domainPermissions?: InputMaybe<Array<UserPermissionsInput>>;
  email: Scalars['String'];
  password?: InputMaybe<Scalars['String']>;
};

export type AddUserPayload = MutationResponse & {
  __typename?: 'AddUserPayload';
  ok: Scalars['Boolean'];
  user?: Maybe<User>;
};

export type Alert = {
  __typename?: 'Alert';
  category?: Maybe<AlertCategories>;
  createdAt?: Maybe<Scalars['DateTime']>;
  device?: Maybe<Device>;
  deviceId?: Maybe<Scalars['ID']>;
  dismissible?: Maybe<Scalars['Boolean']>;
  domain?: Maybe<Domain>;
  domainId?: Maybe<Scalars['ID']>;
  id?: Maybe<Scalars['ID']>;
  level?: Maybe<AlertSeverity>;
  message?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['ID']>;
};

export enum AlertCategories {
  Clocking = 'CLOCKING',
  Connectivity = 'CONNECTIVITY',
  Latency = 'LATENCY',
  Subscriptions = 'SUBSCRIPTIONS',
  System = 'SYSTEM'
}

export type AlertMessage = {
  __typename?: 'AlertMessage';
  clocking?: Maybe<Scalars['String']>;
  connectivity?: Maybe<Scalars['String']>;
  latency?: Maybe<Scalars['String']>;
  subscriptions?: Maybe<Scalars['String']>;
};

export enum AlertSeverity {
  Error = 'ERROR',
  Information = 'INFORMATION',
  Warning = 'WARNING'
}

export type ApiKey = {
  description?: Maybe<Scalars['String']>;
  displayKey: Scalars['String'];
  id: Scalars['ID'];
};

export type AssignDomainClockingGroupInput = {
  clockingGroupId?: InputMaybe<Scalars['ID']>;
  domainId?: InputMaybe<Scalars['ID']>;
};

export type AssignDomainClockingGroupPayload = MutationResponse & {
  __typename?: 'AssignDomainClockingGroupPayload';
  ok: Scalars['Boolean'];
};

export type AuditLog = {
  __typename?: 'AuditLog';
  category?: Maybe<Scalars['String']>;
  domain?: Maybe<Domain>;
  id?: Maybe<Scalars['ID']>;
  severity?: Maybe<AuditLogSeverity>;
  source?: Maybe<AuditLogSource>;
  target?: Maybe<AuditLogTarget>;
  text?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['DateTime']>;
  type?: Maybe<Scalars['String']>;
};

export enum AuditLogSeverity {
  Critical = 'CRITICAL',
  Error = 'ERROR',
  Information = 'INFORMATION',
  Warning = 'WARNING'
}

export type AuditLogSource = Device | User;

export type AuditLogTarget = Device | User;

export type AutomaticallyConfigureClockingGroupInput = {
  clockingGroupId: Scalars['ID'];
};

export type AutomaticallyConfigureClockingGroupPayload = MutationResponse & {
  __typename?: 'AutomaticallyConfigureClockingGroupPayload';
  ok: Scalars['Boolean'];
};

export type Capabilities = {
  __typename?: 'Capabilities';
  CAN_UNICAST_CLOCKING?: Maybe<Scalars['Boolean']>;
  CAN_WRITE_EXT_WORD_CLOCK?: Maybe<Scalars['Boolean']>;
  CAN_WRITE_PREFERRED_MASTER?: Maybe<Scalars['Boolean']>;
  CAN_WRITE_SLAVE_ONLY?: Maybe<Scalars['Boolean']>;
  CAN_WRITE_UNICAST_DELAY_REQUESTS?: Maybe<Scalars['Boolean']>;
};

export type ChangePreferedLeaderForDeviceInput = {
  deviceId: Scalars['ID'];
  enabled: Scalars['Boolean'];
};

export type ChangePreferedLeaderForDevicePayload = MutationResponse & {
  __typename?: 'ChangePreferedLeaderForDevicePayload';
  ok: Scalars['Boolean'];
};

export type ChangeSyncToExternalForDeviceInput = {
  deviceId: Scalars['ID'];
  enabled: Scalars['Boolean'];
};

export type ChangeSyncToExternalForDevicePayload = MutationResponse & {
  __typename?: 'ChangeSyncToExternalForDevicePayload';
  ok: Scalars['Boolean'];
};

export type ChangeUnicastClockingForDeviceInput = {
  deviceId: Scalars['ID'];
  enabled: Scalars['Boolean'];
};

export type ChangeUnicastClockingForDevicePayload = MutationResponse & {
  __typename?: 'ChangeUnicastClockingForDevicePayload';
  ok: Scalars['Boolean'];
};

export type ChangeV1UnicastDelayRequestsForDeviceInput = {
  deviceId: Scalars['ID'];
  enabled: Scalars['Boolean'];
};

export type ChangeV1UnicastDelayRequestsForDevicePayload = MutationResponse & {
  __typename?: 'ChangeV1UnicastDelayRequestsForDevicePayload';
  ok: Scalars['Boolean'];
};

export type ClockPreferences = {
  __typename?: 'ClockPreferences';
  externalWordClock?: Maybe<Scalars['Boolean']>;
  leader?: Maybe<Scalars['Boolean']>;
  unicastClocking?: Maybe<Scalars['Boolean']>;
  v1UnicastDelayRequests?: Maybe<Scalars['Boolean']>;
};

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
  Unknown = 'UNKNOWN'
}

export type ClockingGroup = {
  __typename?: 'ClockingGroup';
  mode?: Maybe<ClockingGroupMode>;
  ptp?: Maybe<ClockingGroupPtp>;
  rtp?: Maybe<ClockingGroupRtp>;
};

export enum ClockingGroupMode {
  Aes67 = 'AES67',
  Default = 'DEFAULT',
  Smpte = 'SMPTE'
}

export type ClockingGroupPtp = {
  __typename?: 'ClockingGroupPtp';
  dantePriorities?: Maybe<Scalars['Boolean']>;
  followerOnly?: Maybe<Scalars['Boolean']>;
  v1?: Maybe<Scalars['Boolean']>;
  v1SubdomainName?: Maybe<Scalars['String']>;
  v2?: Maybe<Scalars['Boolean']>;
  v2AnnounceInterval?: Maybe<Scalars['Int']>;
  v2DomainNumber?: Maybe<Scalars['Int']>;
  v2MulticastTtl?: Maybe<Scalars['Int']>;
  v2Priority1?: Maybe<Scalars['Int']>;
  v2Priority2?: Maybe<Scalars['Int']>;
  v2SyncInterval?: Maybe<Scalars['Int']>;
};

export type ClockingGroupPtpInput = {
  dantePriorities?: InputMaybe<Scalars['Boolean']>;
  followerOnly?: InputMaybe<Scalars['Boolean']>;
  v1?: InputMaybe<Scalars['Boolean']>;
  v1SubdomainName?: InputMaybe<Scalars['String']>;
  v2?: InputMaybe<Scalars['Boolean']>;
  v2AnnounceInterval?: InputMaybe<Scalars['Int']>;
  v2DomainNumber?: InputMaybe<Scalars['Int']>;
  v2MulticastTtl?: InputMaybe<Scalars['Int']>;
  v2Priority1?: InputMaybe<Scalars['Int']>;
  v2Priority2?: InputMaybe<Scalars['Int']>;
  v2SyncInterval?: InputMaybe<Scalars['Int']>;
};

export type ClockingGroupRtp = {
  __typename?: 'ClockingGroupRtp';
  prefixV4?: Maybe<Scalars['Int']>;
  rxLatency?: Maybe<Scalars['Int']>;
  systemPacketTime?: Maybe<Scalars['Int']>;
  transmitPort?: Maybe<Scalars['Int']>;
};

export type ClockingGroupRtpInput = {
  prefixV4?: InputMaybe<Scalars['Int']>;
  rxLatency?: InputMaybe<Scalars['Int']>;
  systemPacketTime?: InputMaybe<Scalars['Int']>;
  transmitPort?: InputMaybe<Scalars['Int']>;
};

export type ClockingState = {
  __typename?: 'ClockingState';
  followerWithoutLeader?: Maybe<Scalars['Boolean']>;
  frequencyOffset?: Maybe<Scalars['String']>;
  grandLeader?: Maybe<Scalars['Boolean']>;
  locked?: Maybe<ClockSyncServo>;
  multicastLeader?: Maybe<Scalars['Boolean']>;
  muteStatus?: Maybe<Scalars['String']>;
  unicastFollower?: Maybe<Scalars['Boolean']>;
  unicastLeader?: Maybe<Scalars['Boolean']>;
};

export enum ConnectionState {
  Disconnected = 'DISCONNECTED',
  Established = 'ESTABLISHED',
  Ready = 'READY'
}

export type CreateServiceApiKeyInput = {
  defaultRole?: InputMaybe<UserDomainRoles>;
  description?: InputMaybe<Scalars['String']>;
  domainPermissions?: InputMaybe<Array<UserPermissionsInput>>;
  name: Scalars['String'];
};

export type CreateServiceApiKeyPayload = MutationResponse & {
  __typename?: 'CreateServiceApiKeyPayload';
  key: ServiceApiKey;
  keyToken: Scalars['String'];
  ok: Scalars['Boolean'];
};

export type CreateUserApiKeyInput = {
  description?: InputMaybe<Scalars['String']>;
};

export type CreateUserApiKeyPayload = MutationResponse & {
  __typename?: 'CreateUserApiKeyPayload';
  key: UserApiKey;
  keyToken: Scalars['String'];
  ok: Scalars['Boolean'];
};

export type DeleteApiKeyInput = {
  keyId: Scalars['ID'];
};

export type DeleteApiKeyPayload = MutationResponse & {
  __typename?: 'DeleteApiKeyPayload';
  ok: Scalars['Boolean'];
};

export type DeleteUserInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type DeleteUserPayload = MutationResponse & {
  __typename?: 'DeleteUserPayload';
  ok: Scalars['Boolean'];
};

export type Device = {
  __typename?: 'Device';
  alerts?: Maybe<Array<Maybe<Alert>>>;
  auditLogs?: Maybe<Array<Maybe<AuditLog>>>;
  capabilities?: Maybe<Capabilities>;
  clockPreferences?: Maybe<ClockPreferences>;
  clockingState?: Maybe<ClockingState>;
  comments?: Maybe<Scalars['String']>;
  connection?: Maybe<DeviceConnection>;
  description?: Maybe<Scalars['String']>;
  domain?: Maybe<Domain>;
  domainId?: Maybe<Scalars['ID']>;
  enrolmentState?: Maybe<EnrolmentState>;
  id: Scalars['ID'];
  identity?: Maybe<Identity>;
  interfaces?: Maybe<Array<Maybe<Interface>>>;
  location?: Maybe<Scalars['String']>;
  manufacturer?: Maybe<Manufacturer>;
  name: Scalars['String'];
  picture?: Maybe<Scalars['String']>;
  platform?: Maybe<Platform>;
  product?: Maybe<Product>;
  rxChannels?: Maybe<Array<Maybe<RxChannel>>>;
  status?: Maybe<DeviceStatus>;
  txChannels?: Maybe<Array<Maybe<TxChannel>>>;
};


export type DeviceAuditLogsArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  before?: InputMaybe<Scalars['DateTime']>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

export type DeviceConnection = {
  __typename?: 'DeviceConnection';
  lastChanged?: Maybe<Scalars['DateTime']>;
  state?: Maybe<ConnectionState>;
};

export type DeviceRxChannelsSubscriptionInput = {
  /**
   * The channel number on the device which will receive the subscription
   *
   * Examples:
   *   - 1
   *   - 19
   *
   * Channel numbers start at 1
   */
  rxChannelIndex: Scalars['Int'];
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
  subscribedChannel: Scalars['String'];
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
  subscribedDevice: Scalars['String'];
};

export type DeviceStatus = {
  __typename?: 'DeviceStatus';
  alertMessage?: Maybe<AlertMessage>;
  clocking?: Maybe<Status>;
  connectivity?: Maybe<Status>;
  latency?: Maybe<Status>;
  subscriptions?: Maybe<Status>;
  summary?: Maybe<Status>;
};

export type Domain = {
  __typename?: 'Domain';
  alerts?: Maybe<Array<Maybe<Alert>>>;
  auditLogs?: Maybe<Array<Maybe<AuditLog>>>;
  clockingGroup?: Maybe<ClockingGroup>;
  clockingGroupId?: Maybe<Scalars['ID']>;
  device?: Maybe<Device>;
  devices?: Maybe<Array<Maybe<Device>>>;
  icon?: Maybe<DomainIcon>;
  id: Scalars['ID'];
  legacyInterop?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  role?: Maybe<Role>;
  status?: Maybe<DomainStatus>;
  users?: Maybe<Array<Maybe<User>>>;
};


export type DomainAuditLogsArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  before?: InputMaybe<Scalars['DateTime']>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type DomainDeviceArgs = {
  id: Scalars['ID'];
};

export type DomainAlertMessage = {
  __typename?: 'DomainAlertMessage';
  message: Scalars['String'];
  messageSeverity: Status;
};

export type DomainAlertMessages = {
  __typename?: 'DomainAlertMessages';
  clocking?: Maybe<DomainAlertMessage>;
  connectivity?: Maybe<DomainAlertMessage>;
  latency?: Maybe<DomainAlertMessage>;
  subscriptions?: Maybe<DomainAlertMessage>;
};

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
  Transportation_2 = 'TRANSPORTATION_2'
}

export type DomainStatus = {
  __typename?: 'DomainStatus';
  clocking?: Maybe<Status>;
  connectivity?: Maybe<Status>;
  domainAlertMessage?: Maybe<DomainAlertMessages>;
  latency?: Maybe<Status>;
  subscriptions?: Maybe<Status>;
  summary?: Maybe<Status>;
};

export type EnrolDevicesInput = {
  clearConfig?: InputMaybe<Scalars['Boolean']>;
  deviceIds: Array<Scalars['ID']>;
  domainId?: InputMaybe<Scalars['ID']>;
};

export type EnrolDevicesPayload = MutationResponse & {
  __typename?: 'EnrolDevicesPayload';
  ok: Scalars['Boolean'];
};

export enum EnrolmentState {
  ChangingDomain = 'CHANGING_DOMAIN',
  Enrolled = 'ENROLLED',
  Enrolling = 'ENROLLING',
  Unenrolled = 'UNENROLLED',
  Unenrolling = 'UNENROLLING'
}

export type ForgetDevicesInput = {
  deviceIds: Array<Scalars['ID']>;
};

export type ForgetDevicesPayload = MutationResponse & {
  __typename?: 'ForgetDevicesPayload';
  ok: Scalars['Boolean'];
};

export type Identity = {
  __typename?: 'Identity';
  /** The name given to the device by the user. Example: 'Foyer' */
  actualName?: Maybe<Scalars['String']>;
  /**
   * The name given to the device (actualName) which may be appended with a numeric identifier if  a device of the same actualName already exists. Example: 'Foyer (2)'
   * @deprecated Not used in managed environments. Use device.name
   */
  advertisedName?: Maybe<Scalars['String']>;
  danteHardwareVersion?: Maybe<Scalars['String']>;
  danteVersion?: Maybe<Scalars['String']>;
  /** The name that the device will have when it is unboxed or factory reset. Typically contains the MAC address. Example: 'AVIOAO2-51f9e7' */
  defaultName?: Maybe<Scalars['String']>;
  instanceId: Scalars['ID'];
  /** @deprecated Use manufacturer.id */
  manufacturerId?: Maybe<Scalars['String']>;
  /** @deprecated Use manufacturer.name */
  manufacturerName?: Maybe<Scalars['String']>;
  productModelId?: Maybe<Scalars['String']>;
  productModelName?: Maybe<Scalars['String']>;
  productSoftwareVersion?: Maybe<Scalars['String']>;
  productVersion?: Maybe<Scalars['String']>;
};

export type Interface = {
  __typename?: 'Interface';
  address?: Maybe<Scalars['String']>;
  macAddress?: Maybe<Scalars['String']>;
  netmask?: Maybe<Scalars['Int']>;
  subnet?: Maybe<Scalars['String']>;
};

export type LoginInput = {
  email?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
};

export type LoginPayload = MutationResponse & {
  __typename?: 'LoginPayload';
  ok: Scalars['Boolean'];
  /**  The authentication token to be used in subsequent requests in the 'Authorization' header.  */
  token?: Maybe<Scalars['ID']>;
};

export type LogoutPayload = MutationResponse & {
  __typename?: 'LogoutPayload';
  ok: Scalars['Boolean'];
};

export type ManuallyConfigureClockingGroupInput = {
  clockingGroupId: Scalars['ID'];
  mode?: InputMaybe<ClockingGroupMode>;
  ptp?: InputMaybe<ClockingGroupPtpInput>;
  rtp?: InputMaybe<ClockingGroupRtpInput>;
};

export type ManuallyConfigureClockingGroupPayload = MutationResponse & {
  __typename?: 'ManuallyConfigureClockingGroupPayload';
  ok: Scalars['Boolean'];
};

/**
 * The Manufacturer of a device or software.
 *
 * Examples: "Acme Incorporated"
 *
 * See also: Product
 */
export type Manufacturer = {
  __typename?: 'Manufacturer';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addDomain: AddDomainPayload;
  addUser?: Maybe<AddUserPayload>;
  assignDomainClockingGroup?: Maybe<AssignDomainClockingGroupPayload>;
  automaticallyConfigureClockingGroup?: Maybe<AutomaticallyConfigureClockingGroupPayload>;
  changePreferedLeaderForDevice?: Maybe<ChangePreferedLeaderForDevicePayload>;
  changeSyncToExternalForDevice?: Maybe<ChangeSyncToExternalForDevicePayload>;
  changeUnicastClockingForDevice?: Maybe<ChangeUnicastClockingForDevicePayload>;
  changeV1UnicastDelayRequestsForDevice?: Maybe<ChangeV1UnicastDelayRequestsForDevicePayload>;
  createServiceApiKey?: Maybe<CreateServiceApiKeyPayload>;
  createUserApiKey?: Maybe<CreateUserApiKeyPayload>;
  deleteApiKey?: Maybe<DeleteApiKeyPayload>;
  deleteUser?: Maybe<DeleteUserPayload>;
  enrolDevices?: Maybe<EnrolDevicesPayload>;
  /**
   * ⚠️ Warning! Forgetting the device should only be used when the physical device is lost or broken and cannot connect to the server.
   * In most scenarios it is preferable to use unenrollDevices()
   */
  forgetDevices?: Maybe<ForgetDevicesPayload>;
  login?: Maybe<LoginPayload>;
  logout?: Maybe<LogoutPayload>;
  manuallyConfigureClockingGroup?: Maybe<ManuallyConfigureClockingGroupPayload>;
  removeDomain: RemoveDomainPayload;
  requestPasswordReset?: Maybe<RequestPasswordResetPayload>;
  resetViaToken?: Maybe<ResetPasswordViaTokenPayload>;
  setDeviceSubscriptions?: Maybe<SetDeviceSubscriptionsPayload>;
  setUserDomainRole?: Maybe<SetUserDomainRolePayload>;
  unenrollDevices?: Maybe<UnenrollDevicesPayload>;
  updateDomain: UpdateDomainPayload;
  updatePassword?: Maybe<UpdatePasswordPayload>;
  updateServiceApiKeyPermissions?: Maybe<UpdateServiceApiKeyPermissionsPayload>;
  updateUserPermissions?: Maybe<UpdateUserPermissionsPayload>;
  updateUserPreferences?: Maybe<UpdateUserPreferencesPayload>;
};


export type MutationAddDomainArgs = {
  input: AddDomainInput;
};


export type MutationAddUserArgs = {
  input: AddUserInput;
};


export type MutationAssignDomainClockingGroupArgs = {
  input: AssignDomainClockingGroupInput;
};


export type MutationAutomaticallyConfigureClockingGroupArgs = {
  input: AutomaticallyConfigureClockingGroupInput;
};


export type MutationChangePreferedLeaderForDeviceArgs = {
  input: ChangePreferedLeaderForDeviceInput;
};


export type MutationChangeSyncToExternalForDeviceArgs = {
  input: ChangeSyncToExternalForDeviceInput;
};


export type MutationChangeUnicastClockingForDeviceArgs = {
  input: ChangeUnicastClockingForDeviceInput;
};


export type MutationChangeV1UnicastDelayRequestsForDeviceArgs = {
  input: ChangeV1UnicastDelayRequestsForDeviceInput;
};


export type MutationCreateServiceApiKeyArgs = {
  input: CreateServiceApiKeyInput;
};


export type MutationCreateUserApiKeyArgs = {
  input: CreateUserApiKeyInput;
};


export type MutationDeleteApiKeyArgs = {
  input: DeleteApiKeyInput;
};


export type MutationDeleteUserArgs = {
  input: DeleteUserInput;
};


export type MutationEnrolDevicesArgs = {
  input?: InputMaybe<EnrolDevicesInput>;
};


export type MutationForgetDevicesArgs = {
  input?: InputMaybe<ForgetDevicesInput>;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationManuallyConfigureClockingGroupArgs = {
  input: ManuallyConfigureClockingGroupInput;
};


export type MutationRemoveDomainArgs = {
  input: RemoveDomainInput;
};


export type MutationRequestPasswordResetArgs = {
  input: RequestPasswordResetInput;
};


export type MutationResetViaTokenArgs = {
  input: ResetViaTokenInput;
};


export type MutationSetDeviceSubscriptionsArgs = {
  input: SetDeviceSubscriptionsInput;
};


export type MutationSetUserDomainRoleArgs = {
  input: SetUserDomainRoleInput;
};


export type MutationUnenrollDevicesArgs = {
  input?: InputMaybe<UnenrollDevicesInput>;
};


export type MutationUpdateDomainArgs = {
  input: UpdateDomainInput;
};


export type MutationUpdatePasswordArgs = {
  input: UpdatePasswordInput;
};


export type MutationUpdateServiceApiKeyPermissionsArgs = {
  input: UpdateServiceApiKeyPermissionsInput;
};


export type MutationUpdateUserPermissionsArgs = {
  input: UpdateUserPermissionsInput;
};


export type MutationUpdateUserPreferencesArgs = {
  input: UpdateUserPreferencesInput;
};

export type MutationResponse = {
  ok: Scalars['Boolean'];
};

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
  __typename?: 'Platform';
  name: Scalars['String'];
};

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
  __typename?: 'Product';
  /** The name of the product from the OEM */
  name: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  account: Account;
  accountLogs?: Maybe<Array<Maybe<AuditLog>>>;
  apiKey?: Maybe<ApiKey>;
  apiKeys: Array<ApiKey>;
  auditLogs?: Maybe<Array<Maybe<AuditLog>>>;
  domain?: Maybe<Domain>;
  domains: Array<Maybe<Domain>>;
  me?: Maybe<User>;
  unenrolledDevices: Array<Device>;
  user?: Maybe<User>;
  users?: Maybe<Array<Maybe<User>>>;
};


export type QueryAccountLogsArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  before?: InputMaybe<Scalars['DateTime']>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type QueryApiKeyArgs = {
  id: Scalars['ID'];
};


export type QueryAuditLogsArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  before?: InputMaybe<Scalars['DateTime']>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type QueryDomainArgs = {
  id?: InputMaybe<Scalars['ID']>;
  name?: InputMaybe<Scalars['String']>;
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['ID']>;
};

export type RemoveDomainInput = {
  id: Scalars['ID'];
};

export type RemoveDomainPayload = MutationResponse & {
  __typename?: 'RemoveDomainPayload';
  ok: Scalars['Boolean'];
};

export type RequestPasswordResetInput = {
  email: Scalars['String'];
};

export type RequestPasswordResetPayload = MutationResponse & {
  __typename?: 'RequestPasswordResetPayload';
  ok: Scalars['Boolean'];
};

export type ResetPasswordViaTokenPayload = MutationResponse & {
  __typename?: 'ResetPasswordViaTokenPayload';
  ok: Scalars['Boolean'];
};

export type ResetViaTokenInput = {
  password: Scalars['String'];
  token: Scalars['String'];
};

export type Role = {
  __typename?: 'Role';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
};

export type RxChannel = {
  __typename?: 'RxChannel';
  enabled?: Maybe<Scalars['Boolean']>;
  /**  A unique identifier for the channel, used for caching purposes. Use 'index' when displaying to users  */
  id: Scalars['ID'];
  /**  The channel number  */
  index: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
  status?: Maybe<RxChannelStatus>;
  /**  The Tx channel name on the the device that this channel is subscribed to  */
  subscribedChannel?: Maybe<Scalars['String']>;
  /**  The deviceId of the device that this channel is subscribed to  */
  subscribedDevice?: Maybe<Scalars['String']>;
  summary?: Maybe<RxChannelSummary>;
};

export enum RxChannelStatus {
  /**
   * Error: Flow formats do not match,
   * e.g. Multicast flow with more slots than receiving device can handle
   */
  BundleFormat = 'BUNDLE_FORMAT',
  /**  Error: Channel formats do not match  */
  ChannelFormat = 'CHANNEL_FORMAT',
  /**  Error: Tx channel latency higher than maximum supported Rx latency  */
  ChannelLatency = 'CHANNEL_LATENCY',
  /**  Error: Tx and Rx and in different clock subdomains  */
  ClockDomain = 'CLOCK_DOMAIN',
  /**  Active subscription to an automatically configured source flow  */
  Dynamic = 'DYNAMIC',
  /**  Error: can't find suitable protocol for dynamic connection  */
  DynamicProtocol = 'DYNAMIC_PROTOCOL',
  /**  Error: HDCP key negotiation failed  */
  HdcpNegotiationFailed = 'HDCP_NEGOTIATION_FAILED',
  /**
   * A flow has been configured but does not have sufficient information to
   * establish an audio connection.
   *
   * For example, configuring a template with no associations.
   */
  Idle = 'IDLE',
  /**  Error: Channel does not exist (eg no such local channel)  */
  InvalidChannel = 'INVALID_CHANNEL',
  /**  Error: Transmitter rejected the bundle request as invalid  */
  InvalidMsg = 'INVALID_MSG',
  /**  Channel Name has been found and processed; setting up flow. This is an transient state  */
  InProgress = 'IN_PROGRESS',
  /**  Manual flow configuration bypassing the standard subscription process  */
  Manual = 'MANUAL',
  /**  No subscription for this channel  */
  None = 'NONE',
  /**
   * Error: The name was found but the connection process failed
   * (the receiver could not communicate with the transmitter)
   */
  NoConnection = 'NO_CONNECTION',
  /**  Error: Receiver is out of resources (e.g. flows)  */
  NoRx = 'NO_RX',
  /**  Error: Transmitter is out of resources (e.g. flows)  */
  NoTx = 'NO_TX',
  /**  Error: Receiver got a QoS failure (too much data) when setting up the flow.  */
  QosFailRx = 'QOS_FAIL_RX',
  /**  Error: Transmitter got a QoS failure (too much data) when setting up the flow.  */
  QosFailTx = 'QOS_FAIL_TX',
  /**  Channel Name has been found, but not yet processed. This is an transient state before the flow is created  */
  Resolved = 'RESOLVED',
  /**  Error: Channel Name explicitly does not exist on this network  */
  ResolvedNone = 'RESOLVED_NONE',
  /**  Error: an error occurred while trying to resolve the channel name  */
  ResolveFail = 'RESOLVE_FAIL',
  /**  Error: Receiver couldn't set up the flow  */
  RxFail = 'RX_FAIL',
  /**  Error: All Rx links are down  */
  RxLinkDown = 'RX_LINK_DOWN',
  /**  Error: There is an external issue with Rx  */
  RxNotReady = 'RX_NOT_READY',
  /**  Error: Rx device does not have a supported subscription mode (unicast/multicast) available  */
  RxUnsupportedSubMode = 'RX_UNSUPPORTED_SUB_MODE',
  /**  Active subscription to a manually configured source flow  */
  Static = 'STATIC',
  /**  Channel is successfully subscribed to own TX channels (local loopback mode)  */
  SubscribeSelf = 'SUBSCRIBE_SELF',
  /**  Error: The given subscription to self was disallowed by the device  */
  SubscribeSelfPolicy = 'SUBSCRIBE_SELF_POLICY',
  /**  Error: Unexpected system failure  */
  SystemFail = 'SYSTEM_FAIL',
  /**  Error: Template-based subscription failed: the unicast template is full  */
  TemplateFull = 'TEMPLATE_FULL',
  /**
   * Error: Template-based subscription failed: something else about the template configuration
   * made it impossible to complete the subscription using the given flow
   */
  TemplateMismatchConfig = 'TEMPLATE_MISMATCH_CONFIG',
  /**  Error: Template-based subscription failed: template and subscription device names don't match  */
  TemplateMismatchDevice = 'TEMPLATE_MISMATCH_DEVICE',
  /**  Error: Template-based subscription failed: flow and channel formats don't match  */
  TemplateMismatchFormat = 'TEMPLATE_MISMATCH_FORMAT',
  /**  Error: Template-based subscription failed: the channel is not part of the given multicast flow  */
  TemplateMissingChannel = 'TEMPLATE_MISSING_CHANNEL',
  /**  Error: Tx access control denied the request  */
  TxAccessControlDenied = 'TX_ACCESS_CONTROL_DENIED',
  /**  Tx access control request is in progress  */
  TxAccessControlPending = 'TX_ACCESS_CONTROL_PENDING',
  /**  Error: Rx device does not support the signal encryption  */
  TxChannelEncrypted = 'TX_CHANNEL_ENCRYPTED',
  /**  Error: Transmitter couldn't set up the flow  */
  TxFail = 'TX_FAIL',
  /**  Error: Tx device cannot support additional unicast flows  */
  TxFanoutLimitReached = 'TX_FANOUT_LIMIT_REACHED',
  /**  Error: All Tx links are down  */
  TxLinkDown = 'TX_LINK_DOWN',
  /**  Error: There is an external issue with Tx  */
  TxNotReady = 'TX_NOT_READY',
  /**  Error: Tx rejected the address given by rx (usually indicates an ARP failure)  */
  TxRejectedAddr = 'TX_REJECTED_ADDR',
  /**  Error: Unexpected response from TX device  */
  TxResponseUnexpected = 'TX_RESPONSE_UNEXPECTED',
  /**  Error: Tx Scheduler failure  */
  TxSchedulerFailure = 'TX_SCHEDULER_FAILURE',
  /**  Error: Tx device does not have a supported subscription mode (unicast/multicast) available  */
  TxUnsupportedSubMode = 'TX_UNSUPPORTED_SUB_MODE',
  /**  Channel Name not yet found on network  */
  Unresolved = 'UNRESOLVED',
  /**  Error: Attempt to use an unsupported feature  */
  Unsupported = 'UNSUPPORTED'
}

export enum RxChannelSummary {
  Connected = 'CONNECTED',
  Error = 'ERROR',
  InProgress = 'IN_PROGRESS',
  None = 'NONE',
  Warning = 'WARNING'
}

export type ServiceApiKey = ApiKey & {
  __typename?: 'ServiceApiKey';
  createdBy?: Maybe<User>;
  defaultRole?: Maybe<UserDomainRoles>;
  description?: Maybe<Scalars['String']>;
  displayKey: Scalars['String'];
  domainPermissions?: Maybe<Array<UserPermissions>>;
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type SetDeviceSubscriptionsInput = {
  /**
   * Allows setting a subscription to a channel name even when the transmitter device does not have a channel by that name
   *
   * Subscriptions to unknown devices or channels may be helpful when restoring a preset.
   *
   * Dante resolves subscriptions by name, so this is a valid configuration. However, the subscription will remain unresolved until the transmitter device has a channel by this name.
   */
  allowSubscriptionToNonExistentChannel?: InputMaybe<Scalars['Boolean']>;
  /**
   * Allows setting a subscription to a device name when that device does not currently exist, typically because it is offline.
   *
   * Subscriptions to unknown devices may be helpful when restoring a preset.
   *
   * Dante resolves subscriptions by name, so this is a valid configuration. However, the subscription will remain unresolved until the transmitter device is online.
   *
   * If set, 'allowSubscriptionToNonExistentChannel' must also be set since the channel name cannot resolve when the device is offline
   */
  allowSubscriptionToNonExistentDevice?: InputMaybe<Scalars['Boolean']>;
  /**
   * The ID of the device which will receive the subscription
   *
   * Examples:
   *   "0ae3b2edf1374c0c836c96649e879c2f" (for software devices like DVS)
   *   "001dc1fffe501c25:0" (for hardware devices like AVIO)
   */
  deviceId: Scalars['ID'];
  subscriptions: Array<DeviceRxChannelsSubscriptionInput>;
};

export type SetDeviceSubscriptionsPayload = MutationResponse & {
  __typename?: 'SetDeviceSubscriptionsPayload';
  ok: Scalars['Boolean'];
};

export type SetUserDomainRoleInput = {
  domainId?: InputMaybe<Scalars['ID']>;
  role?: InputMaybe<UserDomainRoles>;
  userEmail?: InputMaybe<Scalars['String']>;
};

export type SetUserDomainRolePayload = MutationResponse & {
  __typename?: 'SetUserDomainRolePayload';
  ok: Scalars['Boolean'];
};

export enum Status {
  Error = 'ERROR',
  Ok = 'OK',
  Unknown = 'UNKNOWN',
  Warning = 'WARNING'
}

/** A transmit channel of media (either audio or video) from a device */
export type TxChannel = {
  __typename?: 'TxChannel';
  id: Scalars['ID'];
  index: Scalars['Int'];
  name: Scalars['String'];
};

export type UnenrollDevicesInput = {
  clearConfig?: InputMaybe<Scalars['Boolean']>;
  deviceIds: Array<Scalars['ID']>;
};

export type UnenrollDevicesPayload = MutationResponse & {
  __typename?: 'UnenrollDevicesPayload';
  ok: Scalars['Boolean'];
};

export type UpdateDomainInput = {
  icon?: InputMaybe<DomainIcon>;
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateDomainPayload = MutationResponse & {
  __typename?: 'UpdateDomainPayload';
  domain?: Maybe<Domain>;
  ok: Scalars['Boolean'];
};

export type UpdatePasswordInput = {
  password: Scalars['String'];
  userId: Scalars['ID'];
};

export type UpdatePasswordPayload = MutationResponse & {
  __typename?: 'UpdatePasswordPayload';
  ok: Scalars['Boolean'];
};

export type UpdateServiceApiKeyPermissionsInput = {
  defaultRole?: InputMaybe<UserDomainRoles>;
  domainPermissions?: InputMaybe<Array<UserPermissionsInput>>;
  keyId: Scalars['ID'];
};

export type UpdateServiceApiKeyPermissionsPayload = MutationResponse & {
  __typename?: 'UpdateServiceApiKeyPermissionsPayload';
  key: ServiceApiKey;
  ok: Scalars['Boolean'];
};

export type UpdateUserPermissionsInput = {
  defaultRole?: InputMaybe<UserDomainRoles>;
  domainPermissions?: InputMaybe<Array<UserPermissionsInput>>;
  userId: Scalars['ID'];
};

export type UpdateUserPermissionsPayload = MutationResponse & {
  __typename?: 'UpdateUserPermissionsPayload';
  ok: Scalars['Boolean'];
  user?: Maybe<User>;
};

export type UpdateUserPreferencesInput = {
  displayName?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  userId: Scalars['ID'];
};

export type UpdateUserPreferencesPayload = MutationResponse & {
  __typename?: 'UpdateUserPreferencesPayload';
  ok: Scalars['Boolean'];
  user?: Maybe<User>;
};

export type User = {
  __typename?: 'User';
  auditLogs?: Maybe<Array<Maybe<AuditLog>>>;
  defaultRole?: Maybe<UserDomainRoles>;
  displayName?: Maybe<Scalars['String']>;
  domainPermissions?: Maybe<Array<Maybe<UserPermissions>>>;
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  isActive?: Maybe<Scalars['Boolean']>;
};


export type UserAuditLogsArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  before?: InputMaybe<Scalars['DateTime']>;
  limit?: InputMaybe<Scalars['Int']>;
};

export type UserApiKey = ApiKey & {
  __typename?: 'UserApiKey';
  description?: Maybe<Scalars['String']>;
  displayKey: Scalars['String'];
  id: Scalars['ID'];
  user?: Maybe<User>;
  userId: Scalars['ID'];
};

export enum UserDomainRoles {
  DomainControl = 'DomainControl',
  MediaControl = 'MediaControl',
  None = 'None',
  ReadOnly = 'ReadOnly',
  SiteControl = 'SiteControl'
}

export type UserPermissions = {
  __typename?: 'UserPermissions';
  domain?: Maybe<Domain>;
  role?: Maybe<UserDomainRoles>;
};

export type UserPermissionsInput = {
  domainId: Scalars['ID'];
  role?: InputMaybe<UserDomainRoles>;
};

export type SetDeviceSubscriptionsMutationVariables = Exact<{
  setDeviceSubscriptionsInput: SetDeviceSubscriptionsInput;
}>;


export type SetDeviceSubscriptionsMutation = { __typename?: 'Mutation', setDeviceSubscriptions?: { __typename?: 'SetDeviceSubscriptionsPayload', ok: boolean } | null };
